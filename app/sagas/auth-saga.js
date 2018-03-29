import { put, takeEvery, call } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

import {
  deleteFirestoreDoc,
  setFirestore,
  updateFirestore,
} from '../utils/firebase-utils';

export default function* authSaga() {
  yield put({ type: 'AUTH_INIT' });
  const authStateChannel = yield call(createAuthStateChannel);
  yield takeEvery(authStateChannel, authStateChangedSaga);
  yield takeEvery('AUTH_SIGNOUT', authSignOutSaga);
}

function* authSignOutSaga() {
  const { currentUser } = firebase.auth();

  if (currentUser && currentUser.isAnonymous) {
    yield call(deleteFirestoreDoc, {
      collection: 'users',
      doc: currentUser.uid,
    });
    yield call(deleteFirestoreDoc, {
      collection: 'geoPoints',
      doc: currentUser.uid,
    });
    yield call([currentUser, 'delete']);
  } else {
    yield call([firebase.auth()], 'signOut');
  }
}

function* authStateChangedSaga(user) {
  if (user.uid) {
    yield call(setFirestore, {
      collection: 'users',
      doc: user.uid,
      data: {},
      args: {
        merge: true,
      },
    });
    yield call(setFirestore, {
      collection: 'geoPoints',
      doc: user.uid,
      data: {},
      args: {
        merge: true,
      },
    });
    yield call(updateFirestore, {
      collection: 'users',
      doc: user.uid,
      data: {
        device: {
          isEmulator: DeviceInfo.isEmulator(),
          osVersion: DeviceInfo.getSystemVersion(),
          uuid: DeviceInfo.getUniqueID(),
          platform: Platform.OS,
          locale: DeviceInfo.getDeviceLocale(),
        },
      },
    });
    yield put({
      type: 'AUTH_SUCCESS',
      payload: user,
    });
  } else {
    const anonymousUser = yield call([firebase.auth(), 'signInAnonymouslyAndRetrieveData']);

    yield call(setFirestore, {
      collection: 'users',
      doc: anonymousUser.user.uid,
      data: {
        registered: firebase.firestore.FieldValue.serverTimestamp(),
      },
    });

    yield put({
      type: 'AUTH_SUCCESS_NEW_USER',
      payload: {
        isNewUser: anonymousUser.additionalUserInfo.isNewUser,
        isAnonymous: anonymousUser.user.isAnonymous,
        uid: anonymousUser.user.uid,
        metadata: anonymousUser.user.metadata,
      },
    });
  }
}

function createAuthStateChannel() {
  return eventChannel((emit) => {
    const onAuthStateChanged = (user) => {
      emit(user || {});
    };

    const unsubscribe = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return unsubscribe;
  });
}
