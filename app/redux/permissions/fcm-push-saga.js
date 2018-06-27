import { select, put, takeEvery } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';
import Permissions from 'react-native-permissions';
import { Actions } from '../../navigators/navigator-actions';

import { CURRENT_USER_COLLECTION } from '../../constants';

// TODO: store granted state in firestore & reenable in redux store
export default function* fcmPushSaga() {
  yield takeEvery('PERMISSIONS_FCM_REQUEST', fcmPushPermissionSaga);
  yield takeEvery('APP_STATE_ACTIVE', clearBadgeAndNotificationsOnAppForeground);
  yield takeEvery('PERMISSIONS_FCM_CHECK', checkFcmPushPermissionsSaga);
}

function* fcmPushPermissionSaga() {
  try {
    const uid = yield select((state) => state.auth.uid);
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

async function clearBadgeAndNotificationsOnAppForeground() {
  await firebase.notifications().setBadge(0);
  await firebase.notifications().removeAllDeliveredNotifications();
}

function* checkFcmPushPermissionsSaga() {
  const authResult = yield Permissions.request('notification');
  console.log('pushCheck: ', authResult);
  if (authResult === 'authorized') {
    yield put({ type: 'PERMISSIONS_FCM_REQUEST', payload: authResult });
    return;
  }
  yield put({ type: 'PERMISSIONS_FCM_DENIED', payload: authResult });

  yield Actions.navigate({
    key: 'PushPermissionScreen',
    routeName: 'PushPermissionScreen',
    params: {
      navigationFlowType: 'mapViewModal',
    },
  });
}
