import { takeEvery, select, take } from 'redux-saga/effects';
import firebase from 'react-native-firebase';

import { GEO_POINTS_COLLECTION } from '../../constants';

export default function* mapViewMyVisibilitySaga() {
  const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);
  if (!isUserAuthenticated) { // user must be authorized
    yield take('AUTH_SUCCESS');
  }

  yield takeEvery([
    'MICRO_DATE_OUTGOING_REMOVE',
    'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET',
    'MICRO_DATE_OUTGOING_STOPPED_BY_ME',
    'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET',
    'MICRO_DATE_OUTGOING_FINISHED',
    'MICRO_DATE_INCOMING_REMOVE',
    'MICRO_DATE_INCOMING_DECLINED_BY_ME',
    'MICRO_DATE_INCOMING_STOPPED_BY_ME',
    'MICRO_DATE_INCOMING_STOPPED_BY_TARGET',
    'MICRO_DATE_INCOMING_FINISHED',
    'GEO_LOCATION_STARTED',
  ], setMyMapVisibilityModeTo, 'public');

  yield takeEvery([
    'GEO_LOCATION_STOP',
  ], setMyMapVisibilityModeTo, 'private');

  yield takeEvery([
    'MICRO_DATE_INCOMING_START',
    'MICRO_DATE_OUTGOING_STARTED',
  ], microDateVisibilitySaga);
}

function* microDateVisibilitySaga(action) {
  const { targetUser } = action.payload;
  yield* setMyMapVisibilityModeTo(targetUser.id);
}

function* setMyMapVisibilityModeTo(visibility) {
  const myUid = yield select((state) => state.auth.uid);
  yield firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(myUid)
    .update({
      visibility,
    });
}
