import { select, take, put, cancel, all, fork, actionChannel, takeLeading, takeLatest } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import BackgroundGeolocation from 'react-native-background-geolocation';
import firebase from 'react-native-firebase';

import {
  USERS_AROUND_SEARCH_RADIUS_KM,
  GEO_POINTS_COLLECTION,
} from '../../constants';
import { microDateUserMovementsMyMoveSaga } from '../micro-date/micro-date-user-movements-saga';
import GeoUtils from '../../utils/geo-utils';
import DaterBackgroundGeolocation from '../../services/background-geolocation';

export default function* locationSaga() {
  try {
    yield put({ type: 'GEO_LOCATION_INITIALIZE' });

    const startActionChannel = yield actionChannel([
      'GEO_LOCATION_START_AUTO',
      'GEO_LOCATION_START_MANUALLY',
    ]);
    const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);

    if (!isUserAuthenticated) { // user must be authorized
      yield take('AUTH_SUCCESS');
    }

    while (true) {
      yield take(startActionChannel);
      const isAlreadyInitizlied = yield select((state) => state.location.isBackgroundGeolocationInitialized);
      if (!isAlreadyInitizlied) {
        yield DaterBackgroundGeolocation.init();
        yield put({ type: 'GEO_LOCATION_INITIALIZED' });
      }

      const locationChannel = yield createLocationChannel();
      const task1 = yield takeLeading(locationChannel, updateLocationSaga);

      yield DaterBackgroundGeolocation.start();

      // start both tasks at the same time since GEO_LOCATION_UPDATED fires right away after changePace
      const [start, action] = yield all([ // eslint-disable-line
        DaterBackgroundGeolocation.changePace(true),
        take('GEO_LOCATION_UPDATED'), // wait for first update!
      ]);
      yield put({ type: 'GEO_LOCATION_STARTED', payload: action.payload });
      yield put({
        type: 'MAPVIEW_SHOW_MY_LOCATION',
        payload: {
          caller: 'locationSaga',
          zoom: 17,
        },
      });

      const task2 = yield takeLatest([
        'GEO_LOCATION_FORCE_UPDATE',
        'APP_STATE_ACTIVE',
      ], forceUpdate);

      yield take([
        'GEO_LOCATION_STOP',
        'AUTH_SIGNOUT_START',
      ]);
      yield DaterBackgroundGeolocation.stop();
      yield cancel(task1, task2);
      yield locationChannel.close();

      yield put({ type: 'GEO_LOCATION_STOPPED' });
    }
  } catch (error) {
    yield put({ type: 'GEO_LOCATION_MAINSAGA_ERROR', payload: error });
  }
}

function createLocationChannel() {
  return eventChannel((emit) => {
    const onLocation = (location) => {
      const coords = location.location ? location.location.coords : location.coords; // handle location & heartbeat callback params
      emit({
        type: location.location ? 'heartbeat' : 'location',
        ...coords,
      });
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    BackgroundGeolocation.on('location', onLocation, onError);
    BackgroundGeolocation.on('heartbeat', onLocation, onError);

    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      BackgroundGeolocation.un('location', onLocation);
      BackgroundGeolocation.un('heartbeat', onLocation);
    };
    return unsubscribe;
  });
}

function* updateLocationSaga(coords) {
  if (coords && coords.latitude && coords.longitude) {
    yield put({
      type: 'GEO_LOCATION_UPDATED',
      payload: coords,
    });
    yield fork(microDateUserMovementsMyMoveSaga, coords);
    yield fork(restartUsersAroundIfUserMovedTooFarSaga, coords);
  } else if (coords.error) {
    yield put({
      type: 'GEO_LOCATION_UPDATE_CHANNEL_ERROR',
      payload: coords.error,
    });
  } else {
    yield put({
      type: 'GEO_LOCATION_UPDATE_CHANNEL_UNKNOWN_ERROR',
    });
  }
}

function* restartUsersAroundIfUserMovedTooFarSaga(newCoords) {
  const firstCoords = yield select((state) => state.location.firstCoords);

  if (!firstCoords) return;

  const distanceFromFirstCoords = GeoUtils.distance(firstCoords, newCoords);
  if (distanceFromFirstCoords > USERS_AROUND_SEARCH_RADIUS_KM * (1000 / 2)) {
    // restart users around if user travelled distance more than 1/2 of the searchable radius
    yield put({
      type: 'GEO_LOCATION_SET_FIRST_COORDS',
      payload: {
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
      },
    });
    yield put({ type: 'USERS_AROUND_RESTART', payload: distanceFromFirstCoords });
  }
}

function* forceUpdate() {
  try {
    const uid = yield select((state) => state.auth.uid);

    yield DaterBackgroundGeolocation.changePace(true);

    const { payload } = yield take('GEO_LOCATION_UPDATED');

    yield firebase.firestore()
      .collection(GEO_POINTS_COLLECTION)
      .doc(uid)
      .update({
        accuracy: payload.accuracy,
        heading: payload.heading, // use calculated heading if GPS has no heading data
        speed: payload.speed,
        geoPoint: new firebase.firestore.GeoPoint(payload.latitude, payload.longitude),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      });
  } catch (error) {
    yield put({ type: 'GEO_LOCATION_FORE_UPDATE_ERROR', payload: error });
  }
}
