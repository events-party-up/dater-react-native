import { select, take, put, fork } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';

import { CURRENT_USER_COLLECTION } from '../../constants';

// TODO: store granted state in firestore & reenable in redux store
export default function* fcmPushSaga() {
  yield fork(fcmPushPermissionSaga);
}

function* fcmPushPermissionSaga() {
  try {
    const fcmGranted = yield select((state) => state.permissions.fcmGranted);

    if (!fcmGranted) {
      yield take([
        'MICRO_DATE_OUTGOING_REQUEST_INIT',
        'MICRO_DATE_INCOMING_ACCEPT',
      ]);
      const uid = yield select((state) => state.auth.uid);

      yield put({ type: 'PERMISSIONS_FCM_REQUEST' });
      yield firebase.messaging().requestPermission();
      const fcmToken = yield firebase.messaging().getToken();

      yield firebase.firestore()
        .collection(CURRENT_USER_COLLECTION)
        .doc(uid)
        .collection('devices')
        .doc(DeviceInfo.getUniqueID())
        .update({
          fcmToken,
        });
      yield put({ type: 'PERMISSIONS_FCM_GRANTED', payload: fcmToken });
    }
  } catch (error) {
    const uid = yield select((state) => state.auth.uid);
    yield put({ type: 'PERMISSIONS_FCM_DENIED', payload: error.message });
    yield firebase.firestore()
      .collection(CURRENT_USER_COLLECTION)
      .doc(uid)
      .collection('devices')
      .doc(DeviceInfo.getUniqueID())
      .update({
        fcmToken: null,
      });
  }
}
