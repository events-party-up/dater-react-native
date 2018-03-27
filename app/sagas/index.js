import { all } from 'redux-saga/effects';
import compassSaga from './compass-saga';
import mapViewSaga from './mapview-saga';

export default function* rootSaga() {
  yield all([
    compassSaga(),
    mapViewSaga(),
  ]);
}
