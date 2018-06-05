import { all, takeEvery } from 'redux-saga/effects';
import compassSaga from './compass-saga';
import mapViewSaga from './mapview-saga';
import locationSaga from './location-saga';
import authSaga from './auth-saga';
import mapViewInitializeRegionSaga from './mapview-init-region-saga';
import startGeolocationOnFirstUpdate from './location-start-saga';
import mapPanelSagaNew from './map-panel-saga-new';
import usersAroundSaga from './users-around-saga';
import appStateSaga from './app-state-saga';
import microDateSaga from './micro-date/micro-date-saga';
import uploadPhotosSaga from './upload-photos-saga';

export default function* rootSaga() {
  yield all([
    takeEvery('MAPVIEW_READY', mapViewInitializeRegionSaga),
    compassSaga(),
    mapViewSaga(),
    locationSaga(),
    authSaga(),
    startGeolocationOnFirstUpdate(),
    mapPanelSagaNew(),
    usersAroundSaga(),
    appStateSaga(),
    microDateSaga(),
    uploadPhotosSaga(),
  ]);
}
