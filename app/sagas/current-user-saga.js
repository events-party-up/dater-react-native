import { put, takeEvery, select } from 'redux-saga/effects';
import firebase from 'react-native-firebase';

import { CURRENT_USER_COLLECTION } from '../constants';

export default function* currentUserSaga() {
  yield takeEvery('AUTH_SUCCESS', currentUserSignIn);
  yield takeEvery('AUTH_SIGNOUT', currentUserSignOut);
  yield takeEvery('CURRENT_USER_SET_PROFILE_FIELDS', currentUserSetProfileFieldSaga);
  yield takeEvery('AUTH_SIGNOUT', currentUserSignOut);
}


function* currentUserSignIn(action) {
  const { uid } = action.payload;

  const currentUserSnapshot = yield firebase.firestore()
    .collection(CURRENT_USER_COLLECTION)
    .doc(uid)
    .get();
  const currentUser = currentUserSnapshot.data();

  yield put({
    type: 'CURRENT_USER_SIGN_IN',
    payload: {
      uid,
      gender: currentUser.gender,
      name: currentUser.name,
    },
  });
}

function* currentUserSignOut() {
  yield put({ type: 'CURRENT_USER_SIGN_OUT' });
}

function* currentUserSetProfileFieldSaga(action) {
  const fields = action.payload;
  const myUid = yield select((state) => state.currentUser.uid);

  yield firebase.firestore()
    .collection(CURRENT_USER_COLLECTION)
    .doc(myUid)
    .update({
      ...fields,
    });
}
