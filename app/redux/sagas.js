import { delay } from 'redux-saga';
import { put, take, all, select } from 'redux-saga/effects';
import { NativeEventEmitter } from 'react-native';
import ReactNativeHeading from '@zsajjad/react-native-heading';

const compassListener = (state) => state.geo.compass.listener;
const HEADING_UPDATE_ON_DEGREE_CHANGED = 10;

function* helloSaga() {
  yield delay(1000);
  console.log('Hello Sagas');
}

function* compassStart() {
  console.log('Compass start');
  try {
    const didStart = yield ReactNativeHeading.start(HEADING_UPDATE_ON_DEGREE_CHANGED);
    console.log('Did compass start? : ', didStart);
    if (didStart) {
      const listener = new NativeEventEmitter(ReactNativeHeading);
      yield put({ type: 'GEO_COMPASS_HEADING_STARTED', payload: listener });
      yield listener.addListener('headingUpdated', (heading) => {
        put({ type: 'GEO_COMPASS_HEADING_UPDATE', payload: heading });
      });
    } else {
      yield put({ type: 'GEO_COMPASS_HEADING_UNAVAILABLE' });
    }
  } catch (error) {
    yield put({ type: 'GEO_COMPASS_HEADING_UNAVAILABLE', error });
  }
}

function* compassStop() {
  yield ReactNativeHeading.stop();
  const listener = yield select(compassListener);
  yield listener.removeAllListeners('headingUpdated');
}

function* compassSaga() {
  console.log('Compass saga');
  while (true) {
    yield take('GEO_COMPASS_HEADING_START', compassStart);
    yield take('GEO_COMPASS_HEADING_STOP', compassStop);
  }
}

export default function* rootSaga() {
  yield all([
    helloSaga(),
    compassSaga(),
  ]);
}
