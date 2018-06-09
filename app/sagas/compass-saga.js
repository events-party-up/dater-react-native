import { put, take } from 'redux-saga/effects';
import ReactNativeHeading from '@zsajjad/react-native-heading';
// import { eventChannel } from 'redux-saga';
// import { NativeEventEmitter } from 'react-native';

import { HEADING_UPDATE_ON_DEGREE_CHANGED } from '../constants';

export default function* compassSaga() {
  try {
    while (true) {
      yield take('GEO_LOCATION_STARTED');
      // const compassChannel = yield createCompassChannel();
      yield* compassStart();

      yield take('GEO_LOCATION_STOP', compassStop);
      // yield compassChannel.close();
      yield* compassStop();
    }
  } catch (error) {
    yield put({ type: 'GEO_COMPASS_MAINSAGA_ERROR', payload: error });
  }
}

function* compassStart() {
  try {
    const didStart = yield ReactNativeHeading.start(HEADING_UPDATE_ON_DEGREE_CHANGED);
    if (didStart) {
      yield put({ type: 'GEO_COMPASS_HEADING_STARTED' });
    } else {
      yield put({ type: 'GEO_COMPASS_HEADING_UNAVAILABLE' });
    }
  } catch (error) {
    yield put({ type: 'GEO_COMPASS_START_ERROR', payload: error });
  }
}

function* compassStop() {
  try {
    yield ReactNativeHeading.stop();
    yield put({ type: 'GEO_COMPASS_HEADING_STOPPED' });
  } catch (error) {
    yield put({ type: 'GEO_COMPASS_STOP_ERROR', payload: error });
  }
}

// function* updateCompassHeading(heading) {
//   const gpsCoords = yield select((state) => state.location.coords);
//   if (gpsCoords && gpsCoords.heading > 0) return; // do not rotate map if GPS heading is active

//   const wrappedHeading = GeoUtils.wrapCompassHeading(heading);
//   yield put({ type: 'GEO_COMPASS_HEADING_UPDATE', payload: heading });
//   yield put({
//     type: 'MAPVIEW_ANIMATE_TO_HEADING_COMPASS_HEADING',
//     payload: {
//       heading: wrappedHeading,
//     },
//   });
// }

// function createCompassChannel() {
//   const compassListener = new NativeEventEmitter(ReactNativeHeading);

//   return eventChannel((emit) => {
//     const onHeadingUpdated = (heading) => {
//       emit(heading);
//     };

//     compassListener.addListener('headingUpdated', onHeadingUpdated);

//     // this will be invoked when the saga calls `channel.close` method
//     const unsubscribe = () => {
//       // DeviceEventEmitter.removeAllListeners('headingUpdated');
//       compassListener.removeAllListeners('headingUpdated');
//     };
//     return unsubscribe;
//   });
// }
