import { all } from 'redux-saga/effects';
import compassSaga from './compass-saga';

export default function* rootSaga() {
  yield all([
    compassSaga(),
  ]);
}
