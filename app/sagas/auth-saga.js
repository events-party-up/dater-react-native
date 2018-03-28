import { put, takeEvery, call } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

export default function* authSaga() {
  yield put({ type: 'AUTH_INIT' });
  const authStateChannel = yield call(createAuthStateChannel);
  yield takeEvery(authStateChannel, stateChanged);
  yield takeEvery('AUTH_SIGNOUT', signOut);
}

function* signOut() {
  const { currentUser } = firebase.auth();
  if (currentUser && currentUser.isAnonymous) {
    yield firebase.firestore().collection('users').doc(currentUser.uid).delete();
    yield firebase.firestore().collection('geoPoints').doc(currentUser.uid).delete();
    yield currentUser.delete();
  } else {
    yield firebase.auth().signOut();
  }
}

function* stateChanged(user) {
  if (user.uid) {
    console.log('Writing to firestore 1');
    yield firebase.firestore().collection('users').doc(user.uid).set({}, { merge: true });
    console.log('Writing to firestore 2');
    yield firebase.firestore().collection('geoPoints').doc(user.uid).set({}, { merge: true });
    console.log('Writing to firestore 3');
    yield firebase.firestore().collection('users').doc(user.uid)
      .update({
        device: {
          isEmulator: DeviceInfo.isEmulator(),
          osVersion: DeviceInfo.getSystemVersion(),
          uuid: DeviceInfo.getUniqueID(),
          platform: Platform.OS,
          locale: DeviceInfo.getDeviceLocale(),
        },
      });
    yield put({
      type: 'AUTH_SUCCESS',
      payload: user,
    });
  } else {
    // debugger;
    console.log('No user! Signing anonymously');
    // return yield console.log('test');
    const anonymousUser = yield firebase.auth().signInAnonymouslyAndRetrieveData();
    yield firebase.firestore().collection('users').doc(anonymousUser.user.uid).set({
      registered: firebase.firestore.FieldValue.serverTimestamp(),
    });
    yield put({
      type: 'AUTH_SUCCESS',
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
