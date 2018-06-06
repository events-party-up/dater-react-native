import { all, takeEvery } from 'redux-saga/effects';
import compassSaga from './compass-saga';
import mapViewSaga from './mapview/mapview-saga';
import mapViewInitializeRegionSaga from './mapview/mapview-init-region-saga';
import mapViewMyVisibilitySaga from './mapview/mapview-my-visibility-saga';
import locationSaga from './location-saga';
import authSaga from './auth/auth-saga';
import authPhoneSaga from './auth/auth-phone-saga';
import startGeolocationOnFirstUpdate from './location-start-saga';
import mapPanelSagaNew from './map-panel-saga-new';
import usersAroundSaga from './users-around-saga';
import appStateSaga from './app-state-saga';
import microDateSaga from './micro-date/micro-date-saga';
import uploadPhotosSaga from './upload-photos-saga';

export default function* rootSaga() {
  yield all([
    takeEvery('MAPVIEW_READY', mapViewInitializeRegionSaga),
    mapViewSaga(),
    mapViewMyVisibilitySaga(),
    authSaga(),
    authPhoneSaga(),
    compassSaga(),
    locationSaga(),
    startGeolocationOnFirstUpdate(),
    mapPanelSagaNew(),
    usersAroundSaga(),
    appStateSaga(),
    microDateSaga(),
    uploadPhotosSaga(),
  ]);
}
