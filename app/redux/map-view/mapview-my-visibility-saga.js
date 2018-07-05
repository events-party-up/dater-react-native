import { takeEvery, select, take, put, spawn } from 'redux-saga/effects';
import firebase from 'react-native-firebase';

import { GEO_POINTS_COLLECTION } from '../../constants';

export default function* mapViewMyVisibilitySaga() {
  try {
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
      'MICRO_DATE_OUTGOING_CANCELLED',
    ], setMyMapVisibilityModeTo, 'public');

    yield takeEvery([
      'GEO_LOCATION_STOP',
      'AUTH_SIGNOUT_START',
    ], setMyMapVisibilityModeTo, 'private');

    yield takeEvery([
      'MICRO_DATE_OUTGOING_REQUEST',
      'MICRO_DATE_INCOMING_STARTED',
      'MICRO_DATE_OUTGOING_STARTED',
    ], microDateVisibilitySaga);
  } catch (error) {
    yield put({ type: 'MAPVIEW_MY_VISIBILITY_ERROR', payload: error });
  }
}

function* microDateVisibilitySaga(action) {
  switch (action.type) {
    case 'MICRO_DATE_OUTGOING_REQUEST':
      yield* setMyMapVisibilityModeTo(action.payload.requestFor);
      break;
    default:
      yield* setMyMapVisibilityModeTo(action.payload.targetUser.id);
      break;
  }
}

function* setMyMapVisibilityModeTo(visibility) {
  yield spawn(updateVisibilityModeInFirebase, visibility);
  yield put({ type: 'MAPVIEW_MY_VISIBILITY_CHANGE', payload: visibility });
}

async function updateVisibilityModeInFirebase(visibility) {
  const { currentUser } = firebase.auth();
  if (!currentUser) return;
  const { uid } = currentUser;

  await firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(uid)
    .update({
      visibility,
    });
}
