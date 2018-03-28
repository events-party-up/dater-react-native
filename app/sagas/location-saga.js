import { throttle, takeEvery, select, take, put, call } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';
import * as RNBackgroundGeolocation from 'react-native-background-geolocation';

import BackgroundGeolocation from '../services/background-geolocation';

export default function* locationSaga() {
  try {
    const locationChannel = yield call(createLocationChannel);
    yield takeEvery(locationChannel, updateLocation);
    yield takeEvery('GEO_LOCATION_INITIALIZED', startGeoLocationOnInit);

    const action = yield take('GEO_LOCATION_INITIALIZE');
    const mapView = action.payload;
    const locationServiceState = yield BackgroundGeolocation.init();

    yield put({ type: 'GEO_LOCATION_INITIALIZED' });
    yield throttle(5000, 'GEO_LOCATION_UPDATED', animateToCurrentLocation, mapView);

    while (true) {
      yield take('GEO_LOCATION_START');
      if (locationServiceState.enabled) {
        yield BackgroundGeolocation.changePace(true);
      } else {
        yield BackgroundGeolocation.start();
      }
      yield put({ type: 'GEO_LOCATION_STARTED' });
      yield take('GEO_LOCATION_STOP');
      yield console.log('Geo location stopping');
      yield BackgroundGeolocation.stop();
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

  yield firebase.firestore().collection('geoPoints').doc(uid).update({
    accuracy: coords.accuracy,
    heading: coords.heading,
    speed: coords.speed,
    geoPoint: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
    timestamp: firebase.firestore.FieldValue.serverTimestamp(),
  });
}

function createLocationChannel() {
  // `eventChannel` takes a subscriber function
  // the subscriber function takes an `emit` argument to put messages onto the channel
  return eventChannel((emit) => {
    const onLocation = (location) => {
      // puts event payload into the channel
      // this allows a Saga to take this payload from the returned channel
      emit(location.coords);
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    // setup the subscription
    RNBackgroundGeolocation.on('location', onLocation, onError);

    // the subscriber must return an unsubscribe function
    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      RNBackgroundGeolocation.un('location', onLocation);
    };
    return unsubscribe;
  });
}
