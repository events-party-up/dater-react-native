import { put, take, takeEvery, delay, race, select } from 'redux-saga/effects';
import { channel, buffers } from 'redux-saga';

export default function* gpsStateSaga() {
  try {
    const goodGPSChan = yield channel(buffers.none());
    yield takeEvery('GEO_LOCATION_UPDATED', gpsStateNextLocationSaga, goodGPSChan);
  } catch (error) {
    yield put({ type: 'APP_STATE_GPS_ERROR', payload: error });
  }
}

function* gpsStateNextLocationSaga(goodGPSChan, nextLocation) {
  try {
    const coords = nextLocation.payload;
    const isGPSPoorInState = yield select((state) => state.appState.isGPSPoor);
    console.log('isGPSPoorInState: ', isGPSPoorInState);
    if (coords.accuracy > 40) {
      if (isGPSPoorInState) return;
      const { timeout } = yield race({
        goodGPS: take(goodGPSChan),
        timeout: delay(5000),
      });
      if (timeout) {
        yield put({ type: 'APP_STATE_POOR_GPS', payload: coords.accuracy });
      }
    } else {
      yield put(goodGPSChan, true);
      if (isGPSPoorInState) {
        yield put({ type: 'APP_STATE_GOOD_GPS', payload: coords.accuracy });
      }
    }
  } catch (error) {
    yield put({ type: 'APP_STATE_GPS_ERROR', payload: error });
  }
}
