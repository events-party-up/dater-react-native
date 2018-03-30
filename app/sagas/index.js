import { all } from 'redux-saga/effects';
import compassSaga from './compass-saga';
import mapViewSaga from './mapview-saga';
import locationSaga from './location-saga';
import authSaga from './auth-saga';
import mapViewInitRegionSaga from './mapview-init-region-saga';

export default function* rootSaga() {
  yield all([
    compassSaga(),
    mapViewSaga(),
    locationSaga(),
    authSaga(),
    mapViewInitRegionSaga(),
  ]);
}
