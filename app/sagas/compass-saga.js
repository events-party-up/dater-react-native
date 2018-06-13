import { put, take, takeEvery, cancel } from 'redux-saga/effects';
import ReactNativeHeading from '@zsajjad/react-native-heading';

import { HEADING_UPDATE_ON_DEGREE_CHANGED } from '../constants';

export default function* compassSaga() {
  try {
    while (true) {
      yield take('GEO_LOCATION_STARTED');
      yield* compassStart();
      const task1 = yield takeEvery('APP_STATE_ACTIVE', compassStart);
      const task2 = yield takeEvery('APP_STATE_BACKGROUND', compassStop);

      yield take('GEO_LOCATION_STOP');
      yield* compassStop();
      yield cancel(task1, task2);
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
