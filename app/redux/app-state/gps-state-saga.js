import { put, take, takeEvery, takeLeading, delay, race, select } from 'redux-saga/effects';
import { channel, buffers } from 'redux-saga';

import {
  GOOD_GPS_ACCURACY_MICRODATE_MODE,
  GOOD_GPS_ACCURACY_GENERAL,
  ACTIVATE_POOR_GPS_TIMEOUT,
  ACTIVATE_GOOD_GPS_TIMEOUT,
} from '../../constants';

export default function* gpsStateSaga() {
  try {
    const goodGPSChan = yield channel(buffers.none());
    const badGPSChan = yield channel(buffers.none());
    yield takeEvery('GEO_LOCATION_UPDATED', gpsStateNextLocationSaga, goodGPSChan, badGPSChan);
    yield takeLeading(badGPSChan, badGpsSaga, goodGPSChan);
    yield takeLeading(goodGPSChan, goodGpsSaga);
  } catch (error) {
    yield put({ type: 'APP_STATE_GPS_ERROR', payload: error });
  }
}

function* gpsStateNextLocationSaga(goodGPSChan, badGPSChan, nextLocation) {
  try {
    const coords = nextLocation.payload;
    const isMicroDate = yield select((state) => state.microDate.enabled);
    const accuracyThreshold = isMicroDate ? GOOD_GPS_ACCURACY_MICRODATE_MODE : GOOD_GPS_ACCURACY_GENERAL;

    if (coords.accuracy > accuracyThreshold) {
      yield put(badGPSChan, coords.accuracy);
    } else {
      yield put(goodGPSChan, coords.accuracy);
    }
  } catch (error) {
    yield put({ type: 'APP_STATE_GPS_ERROR', payload: error });
  }
}

function* badGpsSaga(goodGPSChan, accuracy) {
  const gpsIsPoorInState = yield select((state) => state.appState.gpsIsPoor);

  if (gpsIsPoorInState) {
    yield put({ type: 'APP_STATE_POOR_GPS', payload: accuracy });
    return;
  }

  const { goodGPSAccuracy, timeout } = yield race({
    goodGPS: take(goodGPSChan),
    timeout: delay(ACTIVATE_POOR_GPS_TIMEOUT),
  });

  if (timeout) {
    const freshCoords = yield select((state) => state.location.coords);
    yield put({ type: 'APP_STATE_POOR_GPS', payload: freshCoords.accuracy });
    yield put({ type: 'GEO_LOCATION_FORCE_UPDATE' });
  } else {
    yield put({ type: 'APP_STATE_GOOD_GPS', payload: goodGPSAccuracy });
  }
}

function* goodGpsSaga(accuracy) {
  const gpsIsPoorInState = yield select((state) => state.appState.gpsIsPoor);
  if (gpsIsPoorInState) {
    yield delay(ACTIVATE_GOOD_GPS_TIMEOUT);
    yield put({ type: 'APP_STATE_GOOD_GPS', payload: accuracy });
  }
}
