import { take, put, select, all } from 'redux-saga/effects';
import microDatesIncomingRequestsSaga from './micro-dates-incoming-requests-saga';
import microDatesOutgoingRequestsSaga from './micro-dates-outgoing-requests-saga';
import microDatesUserMovementsSaga from './micro-dates-user-movements-saga';

export default function* microDatesSaga() {
  try {
    const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);
    if (!isUserAuthenticated) { // user must be authorized
      yield take('AUTH_SUCCESS');
    }
    const isGeolocationEnabled = yield select((state) => state.location.enabled);
    if (!isGeolocationEnabled) {
      yield take('GEO_LOCATION_STARTED'); // geo location must be enabled
    }
    yield all([
      microDatesIncomingRequestsSaga(),
      microDatesOutgoingRequestsSaga(),
      microDatesUserMovementsSaga(),
    ]);
  } catch (error) {
    yield put({ type: 'FIND_USER_ERROR', payload: error });
  }
}
