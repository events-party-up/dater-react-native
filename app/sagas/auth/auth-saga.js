import { put, takeEvery, call } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { Actions } from '../../navigators/navigator-actions';

import {
  deleteFirestoreDoc,
  setFirestore,
  updateFirestore,
} from '../../utils/firebase-utils';

export default function* authSaga() {
  try {
    yield put({ type: 'AUTH_INIT' });
    const authStateChannel = yield call(createAuthStateChannel);
    yield takeEvery(authStateChannel, authStateChangedSaga);
    yield takeEvery('AUTH_SIGNOUT', authSignOutSaga);
  } catch (error) {
    yield put({ type: 'AUTH_MAINSAGA_ERROR', payload: error });
  }
}

function* authSignOutSaga() {
  try {
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
      yield firebase.auth().signOut();
    }
  } catch (error) {
    yield put({ type: 'AUTH_SIGNOUT_ERROR', payload: error });
  }
}

function* authStateChangedSaga(user) {
  try {
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
      yield put({ type: 'AUTH_SHOW_LOGIN_SCREEN' });
      // yield Actions.navigate({ routeName: 'Login' });
      yield Actions.navigate({ routeName: 'PhoneNumber' });
    }
  } catch (error) {
    yield put({ type: 'AUTH_STATE_CHANGED_ERROR', payload: error });
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
