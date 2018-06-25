import { put, take, takeEvery, takeLeading, delay, race, select } from 'redux-saga/effects';
import { channel, buffers } from 'redux-saga';

const GOOD_GPS_ACCURACY_GENERAL = 5;
const GOOD_GPS_ACCURACY_MICRO_DATE = 40;
const ACTIVATE_POOR_GPS_TIMEOUT = 5000;

export default function* gpsStateSaga() {
  try {
    const goodGPSChan = yield channel(buffers.none());
    const badGPSChan = yield channel(buffers.none());
    yield takeEvery('GEO_LOCATION_UPDATED', gpsStateNextLocationSaga, goodGPSChan, badGPSChan);
    yield takeLeading(badGPSChan, badGpsSaga, goodGPSChan);
  } catch (error) {
    yield put({ type: 'APP_STATE_GPS_ERROR', payload: error });
  }
}

function* gpsStateNextLocationSaga(goodGPSChan, badGPSChan, nextLocation) {
  try {
    const isGpsPoorInState = yield select((state) => state.appState.isGpsPoor);
    const coords = nextLocation.payload;
    const isMicroDate = yield select((state) => state.microDate.enabled);
    const accuracyThreshold = isMicroDate ? GOOD_GPS_ACCURACY_MICRO_DATE : GOOD_GPS_ACCURACY_GENERAL;

    if (coords.accuracy > accuracyThreshold) {
      yield put(badGPSChan, coords.accuracy);
    } else {
      yield put(goodGPSChan, coords.accuracy);
      if (isGpsPoorInState) {
        yield put({ type: 'APP_STATE_GOOD_GPS', payload: coords.accuracy });
      }
    }
  } catch (error) {
    yield put({ type: 'APP_STATE_GPS_ERROR', payload: error });
  }
}

function* badGpsSaga(goodGPSChan, accuracy) {
  const isGpsPoorInState = yield select((state) => state.appState.isGpsPoor);
  if (isGpsPoorInState) {
    yield put({ type: 'APP_STATE_POOR_GPS', payload: accuracy });
    return;
  }

  const { timeout } = yield race({
    goodGPS: take(goodGPSChan),
    timeout: delay(ACTIVATE_POOR_GPS_TIMEOUT),
  });

  if (timeout) {
    const freshCoords = yield select((state) => state.location.coords);
    yield put({ type: 'APP_STATE_POOR_GPS', payload: freshCoords.accuracy });
    yield put({ type: 'GEO_LOCATION_FORCE_UPDATE' });
  }
}
