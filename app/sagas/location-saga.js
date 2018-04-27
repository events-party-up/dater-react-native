import { throttle, takeEvery, select, take, put, call } from 'redux-saga/effects';
import { eventChannel, delay } from 'redux-saga';
import firebase from 'react-native-firebase';
import * as RNBackgroundGeolocation from 'react-native-background-geolocation';

import BackgroundGeolocation from '../services/background-geolocation';
import { updateFirestore } from '../utils/firebase-utils';
import GeoUtils from '../utils/geo-utils';
import {
  DEFAULT_MAPVIEW_ANIMATION_DURATION,
  USERS_AROUND_SEARCH_RADIUS_KM,
} from '../constants';

export default function* locationSaga() {
  try {
    yield put({ type: 'GEO_LOCATION_INITIALIZE' });
    const locationChannel = yield call(createLocationChannel);
    yield takeEvery(locationChannel, updateLocation);
    yield takeEvery('GEO_LOCATION_INITIALIZED', startGeoLocationOnInit);
    yield takeEvery([
      'GEO_LOCATION_FORCE_UPDATE',
      'APP_STATE_ACTIVE',
    ], forceUpdate);
    yield takeEvery(['AUTH_SUCCESS_NEW_USER', 'AUTH_SUCCESS'], writeCoordsToFirestore);

    const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);
    const appState = yield select((state) => state.appState.state);

    if (!isUserAuthenticated && appState !== 'active') { // user must be authorized
      yield take('AUTH_SUCCESS');
    }

    const locationServiceState = yield call([BackgroundGeolocation, 'init']);
    yield put({ type: 'GEO_LOCATION_INITIALIZED' });
    yield throttle(500, 'GEO_LOCATION_UPDATED', locationUpdatedSaga);
    // yield throttle(2000, 'GEO_LOCATION_UPDATED', writeCoordsToFirestore);

    while (true) {
      yield take('GEO_LOCATION_START');
      yield call([BackgroundGeolocation, 'start']);
      yield call([BackgroundGeolocation, 'changePace'], true);
      const action = yield take('GEO_LOCATION_UPDATED'); // wait for first update!
      yield put({ type: 'GEO_LOCATION_STARTED', payload: action.payload });
      yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_START', payload: { caller: 'locationSaga' } });

      yield take('GEO_LOCATION_STOP');
      yield call([BackgroundGeolocation, 'stop']);
      locationServiceState.enabled = false;
      const uid = yield select((state) => state.auth.uid);
      yield call(updateFirestore, {
        collection: 'geoPoints',
        doc: uid,
        data: {
          visible: false,
        },
      });
      yield put({ type: 'GEO_LOCATION_STOPPED' });
    }
  } catch (error) {
    yield put({ type: 'GEO_LOCATION_MAINSAGA_ERROR', payload: error });
  }
}

function* startGeoLocationOnInit() {
  yield put({ type: 'GEO_LOCATION_START' });
}

function* locationUpdatedSaga(action) {
  const isCentered = yield select((state) => state.mapView.centered);
  const isFindUserEnabled = yield select((state) => state.findUser.enabled);
  const currentCoords = action.payload;
  const firstCoords = yield select((state) => state.location.firstCoords);
  if (isCentered) {
    // yield* animateToCurrentLocation(action);
    yield* call(delay, DEFAULT_MAPVIEW_ANIMATION_DURATION);
    yield* animateToBearing(action);
  }
  if (isFindUserEnabled) {
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

// function* animateToCurrentLocation(action) {
//   yield put({
//     type: 'MAPVIEW_ANIMATE_TO_COORDINATE',
//     payload: {
//       coords: {
//         latitude: action.payload.latitude,
//         longitude: action.payload.longitude,
//       },
//     },
//   });
// }

function* animateToBearing(action) {
  const gpsHeading = action.payload.heading;
  if (gpsHeading < 0) return;

  const bearingAngle = GeoUtils.wrapCompassHeading(gpsHeading);
  yield put({
    type: 'MAPVIEW_ANIMATE_TO_BEARING_GPS_HEADING',
    payload: {
      bearingAngle,
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
  yield call([BackgroundGeolocation, 'changePace'], true);
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
