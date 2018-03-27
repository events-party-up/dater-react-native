import { put, take } from 'redux-saga/effects';
import ReactNativeHeading from '@zsajjad/react-native-heading';

const HEADING_UPDATE_ON_DEGREE_CHANGED = 10;

export default function* compassSaga() {
  while (true) {
    yield take('GEO_COMPASS_HEADING_START');
    yield* compassStart();
    yield take('GEO_COMPASS_HEADING_STOP', compassStop);
    yield* compassStop();
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
    yield put({ type: 'GEO_COMPASS_UNKNOWN_ERROR', payload: error });
  }
}

function* compassStop() {
  try {
    yield ReactNativeHeading.stop();
    yield put({ type: 'GEO_COMPASS_HEADING_STOPPED' });
  } catch (error) {
    yield put({ type: 'GEO_COMPASS_UNKNOWN_ERROR', payload: error });
  }
}
