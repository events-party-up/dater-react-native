import { throttle, takeEvery, select, take, put, call } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';
import * as RNBackgroundGeolocation from 'react-native-background-geolocation';

import BackgroundGeolocation from '../services/background-geolocation';
import { updateFirestore } from '../utils/firebase-utils';

export default function* locationSaga() {
  try {
    const locationChannel = yield call(createLocationChannel);
    yield takeEvery(locationChannel, updateLocation);
    yield takeEvery('GEO_LOCATION_INITIALIZED', startGeoLocationOnInit);

    const action = yield take('GEO_LOCATION_INITIALIZE');
    const mapView = action.payload;
    const locationServiceState = yield BackgroundGeolocation.init();

    yield put({ type: 'GEO_LOCATION_INITIALIZED' });
    yield throttle(1000, 'GEO_LOCATION_UPDATED', animateToCurrentLocation, mapView);

    while (true) {
      yield take('GEO_LOCATION_START');
      if (locationServiceState.enabled) {
        yield call([BackgroundGeolocation, 'changePace'], true);
      } else {
        yield call([BackgroundGeolocation, 'start']);
      }
      yield put({ type: 'GEO_LOCATION_STARTED' });
      yield take('GEO_LOCATION_STOP');
      yield call([BackgroundGeolocation, 'stop']);
      yield put({ type: 'GEO_LOCATION_STOPPED' });
    }
  } catch (error) {
    yield put({ type: 'GEO_LOCATION_ERROR', payload: error });
  }
}

function* startGeoLocationOnInit() {
  yield put({ type: 'GEO_LOCATION_START' });
}

function* animateToCurrentLocation(mapView, action) {
  const mapViewState = yield select((state) => state.mapView);
  yield put({
    type: 'MAPVIEW_ANIMATE_TO_REGION',
    payload: {
      mapView,
      region: {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        latitudeDelta: mapViewState.latitudeDelta,
        longitudeDelta: mapViewState.longitudeDelta,
      },
      duration: 1,
    },
  });
}

function* updateLocation(coords) {
  const uid = yield select((state) => state.auth.uid);

  yield put({
    type: 'GEO_LOCATION_UPDATED',
    payload: coords,
  });

  if (!uid) return;

  yield call(updateFirestore, {
    collection: 'geoPoints',
    doc: uid,
    data: {
      accuracy: coords.accuracy,
      heading: coords.heading,
      speed: coords.speed,
      geoPoint: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    },
  });
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
