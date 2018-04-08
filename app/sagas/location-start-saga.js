import { put, take } from 'redux-saga/effects';

export default function* startGeolocationOnFirstUpdate() {
  yield take('GEO_LOCATION_UPDATED');
  yield put({ type: 'GEO_LOCATION_STARTED' });
}
