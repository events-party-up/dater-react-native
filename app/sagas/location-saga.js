import { throttle, takeEvery, select, take, put, call, cancel, all } from 'redux-saga/effects';
import { eventChannel, delay } from 'redux-saga';
import firebase from 'react-native-firebase';
import * as RNBackgroundGeolocation from 'react-native-background-geolocation';

import BackgroundGeolocation from '../services/background-geolocation';
import { updateFirestore, getFirestore } from '../utils/firebase-utils';
import GeoUtils from '../utils/geo-utils';
import {
  DEFAULT_MAPVIEW_ANIMATION_DURATION,
  USERS_AROUND_SEARCH_RADIUS_KM,
} from '../constants';

export default function* locationSaga() {
  try {
    yield takeEvery('GEO_LOCATION_INITIALIZED', startGeoLocationOnInit);
    yield put({ type: 'GEO_LOCATION_INITIALIZE' });

    const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);
    if (!isUserAuthenticated) { // user must be authorized
      yield take('AUTH_SUCCESS');
    }
    const uid = yield select((state) => state.auth.uid);

    yield call([BackgroundGeolocation, 'init']);
    yield put({ type: 'GEO_LOCATION_INITIALIZED' });

    while (true) {
      const startAction = yield take([
        'GEO_LOCATION_START_AUTO',
        'GEO_LOCATION_START_MANUALLY',
      ]);

      if (startAction.type === 'GEO_LOCATION_START_AUTO') {
        const myStatus = yield call(getFirestore, {
          collection: 'geoPoints',
          doc: uid,
        });

        if (!myStatus.visible) {
          continue; // eslint-disable-line
        }
      }

      const locationChannel = yield call(createLocationChannel);
      const task1 = yield takeEvery(locationChannel, updateLocation);
      const task2 = yield takeEvery(['AUTH_SUCCESS_NEW_USER', 'AUTH_SUCCESS'], writeCoordsToFirestore);
      const task3 = yield throttle(500, 'GEO_LOCATION_UPDATED', locationUpdatedSaga);

      yield call([BackgroundGeolocation, 'start']);

      // start both tasks at the same time since GEO_LOCATION_UPDATED fires right away after changePace
      const [start, action] = yield all([ // eslint-disable-line
        call([BackgroundGeolocation, 'changePace'], true),
        take('GEO_LOCATION_UPDATED'), // wait for first update!
      ]);
      yield put({ type: 'GEO_LOCATION_STARTED', payload: action.payload });
      yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_START', payload: { caller: 'locationSaga' } });

      const task4 = yield takeEvery([
        'GEO_LOCATION_FORCE_UPDATE',
        'APP_STATE_ACTIVE',
      ], forceUpdate);

      yield take('GEO_LOCATION_STOP');

      yield call([BackgroundGeolocation, 'stop']);
      yield call(updateFirestore, {
        collection: 'geoPoints',
        doc: uid,
        data: {
          visible: false,
        },
      });
      yield cancel(task1, task2, task3, task4);
      yield locationChannel.close();

      yield put({ type: 'GEO_LOCATION_STOPPED' });
    }
  } catch (error) {
    yield put({ type: 'GEO_LOCATION_MAINSAGA_ERROR', payload: error });
  }
}

function* startGeoLocationOnInit() {
  yield put({ type: 'GEO_LOCATION_START_AUTO' });
}

function* locationUpdatedSaga(action) {
  const isCentered = yield select((state) => state.mapView.centered);
  const isFindUserEnabled = yield select((state) => state.findUser.enabled);
  const currentCoords = action.payload;
  const firstCoords = yield select((state) => state.location.firstCoords);
  if (isCentered) {
    yield* call(delay, DEFAULT_MAPVIEW_ANIMATION_DURATION);
    yield* setCamera(action);
  }
  if (isFindUserEnabled || true) { // TODO: remove, it's temporary hack
    yield put({
      type: 'FIND_USER_MY_MOVE',
      payload: {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
        accuracy: currentCoords.accuracy,
        timestamp: Date.now(),
      },
    });
  }
  if (!firstCoords || !currentCoords) return;

  const distanceFromFirstCoords = GeoUtils.distance(firstCoords, currentCoords);
  if (distanceFromFirstCoords > USERS_AROUND_SEARCH_RADIUS_KM * (1000 / 2)) {
    // restart users around if user travelled distance more than 1/2 of the searchable radius
    yield put({
      type: 'GEO_LOCATION_SET_FIRST_COORDS',
      payload: {
        latitude: currentCoords.latitude,
        longitude: currentCoords.longitude,
      },
    });
    yield put({ type: 'USERS_AROUND_RESTART', payload: distanceFromFirstCoords });
  }
}

function* setCamera(action) {
  const currentHeading = yield select((state) => state.mapView.heading);
  const gpsHeading = action.payload.heading || currentHeading;
  yield put({
    type: 'MAPVIEW_SET_CAMERA',
    payload: {
      heading: gpsHeading,
      latitude: action.payload.latitude,
      longitude: action.payload.longitude,
    },
  });
}

function* updateLocation(coords) {
  if (coords && coords.latitude && coords.longitude) {
    yield put({
      type: 'GEO_LOCATION_UPDATED',
      payload: coords,
    });
    yield* writeCoordsToFirestore();
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

function* writeCoordsToFirestore() {
  try {
    const uid = yield select((state) => state.auth.uid);
    const coords = yield select((state) => state.location.coords);
    if (!uid || !coords) return;

    yield call(updateFirestore, {
      collection: 'geoPoints',
      doc: uid,
      data: {
        visible: true,
        accuracy: coords.accuracy,
        heading: coords.heading,
        speed: coords.speed,
        geoPoint: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
      },
    });
  } catch (error) {
    yield put({ type: 'GEO_LOCATION_UPDATE_FIRESTORE_ERROR', payload: error });
  }
}

function* forceUpdate() {
  try {
    yield call([BackgroundGeolocation, 'changePace'], true);
  } catch (error) {
    yield put({ type: 'GEO_LOCATION_MAINSAGA_ERROR', payload: error });
  }
}

function createLocationChannel() {
  return eventChannel((emit) => {
    const onLocation = (location) => {
      const coords = location.location ? location.location.coords : location.coords; // handle location & heartbeat callback params
      emit(coords);
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    RNBackgroundGeolocation.on('location', onLocation, onError);
    RNBackgroundGeolocation.on('heartbeat', onLocation, onError);

    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      RNBackgroundGeolocation.un('location', onLocation);
      RNBackgroundGeolocation.un('heartbeat', onLocation);
    };
    return unsubscribe;
  });
}

