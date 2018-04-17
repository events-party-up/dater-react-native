import { put, take } from 'redux-saga/effects';

export default function* startGeolocationOnFirstUpdate() {
  while (true) {
    yield take('GEO_LOCATION_START');
    const action = yield take('GEO_LOCATION_UPDATED');
    yield put({ type: 'GEO_LOCATION_STARTED', payload: action.payload });
  }
}
