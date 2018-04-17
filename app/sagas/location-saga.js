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
    const locationChannel = yield call(createLocationChannel);
    yield takeEvery(locationChannel, updateLocation);
    yield takeEvery('GEO_LOCATION_INITIALIZED', startGeoLocationOnInit);
    yield takeEvery(['AUTH_SUCCESS_NEW_USER', 'AUTH_SUCCESS'], writeGeoLocationToFirestore);
    yield take('MAPVIEW_READY');

    const locationServiceState = yield call([BackgroundGeolocation, 'init']);
    yield put({ type: 'GEO_LOCATION_INITIALIZED' });
    yield throttle(500, 'GEO_LOCATION_UPDATED', locationUpdatedSaga);
    yield throttle(2000, 'GEO_LOCATION_UPDATED', writeGeoLocationToFirestore);

    while (true) {
      yield take('GEO_LOCATION_START');
      if (locationServiceState.enabled) {
        yield call([BackgroundGeolocation, 'changePace'], true);
      } else {
        yield call([BackgroundGeolocation, 'start']);
      }
      const action = yield take('GEO_LOCATION_UPDATED'); // wait for first update!
      yield put({ type: 'GEO_LOCATION_STARTED', payload: action.payload });
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
  if (isCentered) {
    yield* animateToCurrentLocation(action);
    yield* call(delay, DEFAULT_MAPVIEW_ANIMATION_DURATION);
    yield* animateToBearing(action);
  }
  const firstCoords = yield select((state) => state.location.firstCoords);
  const currentCoords = action.payload;
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

function* animateToCurrentLocation(action) {
  yield put({
    type: 'MAPVIEW_ANIMATE_TO_COORDINATE',
    payload: {
      coords: {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
      },
    },
  });
}

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

function* writeGeoLocationToFirestore() {
  try {
    const coords = yield select((state) => state.location.coords);
    const uid = yield select((state) => state.auth.uid);
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

function createLocationChannel() {
  return eventChannel((emit) => {
    const onLocation = (location) => {
      emit(location.coords);
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    RNBackgroundGeolocation.on('location', onLocation, onError);

    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      RNBackgroundGeolocation.un('location', onLocation);
    };
    return unsubscribe;
  });
}
