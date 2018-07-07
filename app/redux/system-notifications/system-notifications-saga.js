import { put, take, fork } from 'redux-saga/effects';
import { SystemNotification } from '../../types';

const errorIcon = require('../../assets/icons/error/error.png');
const noErrorIcon = require('../../assets/icons/no-error/no-error.png');
const offlineIcon = require('../../assets/icons/offline/offline.png');
const onlineIcon = require('../../assets/icons/online/online.png');

const defaultTimeToLive = 4000;

export default function* systemNotificaitonsSaga() {
  yield fork(gpsNotifications);
  yield fork(networkNotifications);
}

function* gpsNotifications() {
  while (true) {
    const poorGpsAction = yield take('APP_STATE_POOR_GPS');
    yield triggerPoorGPSNotification(poorGpsAction);

    const goodGpsAction = yield take('APP_STATE_GOOD_GPS');
    yield triggerGoodGPSNotification(goodGpsAction);
  }
}

function* networkNotifications() {
  while (true) {
    const networkIsOffline = yield take('APP_STATE_NETWORK_OFFLINE');
    yield triggerNetworkOfflineNotification(networkIsOffline);

    const networkIsOnline = yield take('APP_STATE_NETWORK_ONLINE');
    yield triggerNetworkOnlineNotification(networkIsOnline);
  }
}

function* triggerPoorGPSNotification(action) {
  const notification: SystemNotification = {
    text: `Плохой сигнал GPS. Выйди на открытую местность.\n(погрешность ${action.payload} м.) `,
    payload: action.payload,
    collapseKey: 'gpsIsPoor',
    collapseKeyToReplace: 'gpsIsGood',
    type: 'permanent',
    icon: errorIcon,
  };
  yield put({ type: 'SYSTEM_NOTIFICATIONS_NEW', payload: notification });
}

function* triggerGoodGPSNotification(action) {
  const notification: SystemNotification = {
    text: 'Сигнал GPS восстановлен!',
    payload: action.payload,
    collapseKey: 'gpsIsGood',
    collapseKeyToReplace: 'gpsIsPoor',
    type: 'temp',
    icon: noErrorIcon,
    TTL: defaultTimeToLive,
  };
  yield put({ type: 'SYSTEM_NOTIFICATIONS_NEW', payload: notification });
}

function* triggerNetworkOfflineNotification(action) {
  const notification: SystemNotification = {
    text: 'Отсутствует интернет-соединение',
    payload: action.payload,
    collapseKey: 'networkIsOffline',
    collapseKeyToReplace: 'networkIsOnline',
    type: 'permanent',
    icon: offlineIcon,
  };
  yield put({ type: 'SYSTEM_NOTIFICATIONS_NEW', payload: notification });
}

function* triggerNetworkOnlineNotification(action) {
  const notification: SystemNotification = {
    text: 'Интернет-соединение восстановлено!',
    payload: action.payload,
    collapseKey: 'networkIsOnline',
    collapseKeyToReplace: 'networkIsOffline',
    type: 'temp',
    icon: onlineIcon,
    TTL: defaultTimeToLive,
  };
  yield put({ type: 'SYSTEM_NOTIFICATIONS_NEW', payload: notification });
}
