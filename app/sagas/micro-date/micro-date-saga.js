import { take, put, select, all } from 'redux-saga/effects';
import microDateIncomingRequestsSaga from './micro-date-incoming-requests-saga';
import microDateOutgoingRequestsSaga from './micro-date-outgoing-requests-saga';
import microDateUserMovementsSaga from './micro-date-user-movements-saga';

export default function* microDateSaga() {
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
      microDateIncomingRequestsSaga(),
      microDateOutgoingRequestsSaga(),
      microDateUserMovementsSaga(),
    ]);
  } catch (error) {
    yield put({ type: 'MICRO_DATE_ROOT_SAGA_ERROR', payload: error });
  }
}
