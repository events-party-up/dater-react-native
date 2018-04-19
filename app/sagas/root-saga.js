import { all, takeEvery } from 'redux-saga/effects';
import compassSaga from './compass-saga';
import mapViewSaga from './mapview-saga';
import locationSaga from './location-saga';
import authSaga from './auth-saga';
import mapViewInitializeRegionSaga from './mapview-init-region-saga';
import startGeolocationOnFirstUpdate from './location-start-saga';
import mapPanelSaga from './map-panel-saga';
// import mapDirectionsSaga from './map-directions-saga';
import usersAroundSaga from './users-around-saga';
import findUserSaga from './find-user-saga';

export default function* rootSaga() {
  yield all([
    takeEvery('GEO_LOCATION_INITIALIZE', mapViewInitializeRegionSaga),
    compassSaga(),
    mapViewSaga(),
    locationSaga(),
    authSaga(),
    startGeolocationOnFirstUpdate(),
    mapPanelSaga(),
    // mapDirectionsSaga(),
    usersAroundSaga(),
    findUserSaga(),
  ]);
}
