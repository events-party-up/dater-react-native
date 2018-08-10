import { take, put, select, all, takeEvery } from 'redux-saga/effects';

import microDateUserMovementsSaga from './micro-date-user-movements-saga';
import microDateActiveSaga from './micro-date-active-saga';
import microDateSearchSaga from './micro-date-search-saga';

export default function* microDateRootSaga() {
  try {
    const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);
    if (!isUserAuthenticated) { // user must be authorized
      yield take('AUTH_SUCCESS');
    }

    const isGeolocationEnabled = yield select((state) => state.location.enabled);
    if (!isGeolocationEnabled) {
      yield take('GEO_LOCATION_STARTED'); // geo location must be enabled
    }
    yield takeEvery('UPLOAD_PHOTO_START', microDateUploadingPhoto);

    yield all([
      microDateActiveSaga(),
      microDateUserMovementsSaga(),
      microDateSearchSaga(),
    ]);
  } catch (error) {
    yield put({ type: 'MICRO_DATE_ROOT_SAGA_ERROR', payload: error });
  }
}

function* microDateUploadingPhoto(action) {
  if (action.payload.type === 'microDateSelfie') {
    yield put({ type: 'MICRO_DATE_UPLOAD_PHOTO_START', payload: action.payload });
  }
}
