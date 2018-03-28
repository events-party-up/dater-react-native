import { all } from 'redux-saga/effects';
import compassSaga from './compass-saga';
import mapViewSaga from './mapview-saga';
import locationSaga from './location-saga';

export default function* rootSaga() {
  yield all([
    compassSaga(),
    mapViewSaga(),
    locationSaga(),
  ]);
}
