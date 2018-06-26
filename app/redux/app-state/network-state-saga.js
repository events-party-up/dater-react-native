import { put, take, takeLeading, takeLatest, delay, race, select } from 'redux-saga/effects';
import { eventChannel, channel, buffers } from 'redux-saga';
import { NetInfo } from 'react-native';
import firebase from 'react-native-firebase';

const ACTIVATE_NETWORK_ONLINE_TIMEOUT = 2000;
const ACTIVATE_NETWORK_OFFLINE_TIMEOUT = 5000;

export default function* networkStateSaga() {
  try {
    const networkStateChannel = yield createNetworkStateChannel();
    const networkOnlineChan = yield channel(buffers.none());
    const networkOfflineChan = yield channel(buffers.none());

    yield takeLatest(networkStateChannel, updateNetworkStateSaga, networkOnlineChan, networkOfflineChan);
    yield takeLeading(networkOfflineChan, networkOfflineSaga, networkOnlineChan);
    yield takeLeading(networkOnlineChan, networkOnlineSaga);
  } catch (error) {
    yield put({ type: 'APP_STATE_NETWORK_ERROR', payload: error });
  }
}

function* updateNetworkStateSaga(networkOnlineChan, networkOfflineChan, networkState) {
  try {
    console.log('networkStateSaga: ', networkState);

    if (networkState.type === 'none' || networkState.type === 'unknown') {
      yield put(networkOfflineChan, networkState);
    } else {
      yield put(networkOnlineChan, networkState);
    }
  } catch (error) {
    yield put({ type: 'APP_STATE_NETWORK_ERROR', payload: error });
  }
}

function* networkOfflineSaga(networkOnlineChan, networkState) {
  const networkIsOfflineInState = yield select((state) => state.appState.networkIsOffline);

  if (networkIsOfflineInState) {
    yield put({ type: 'APP_STATE_NETWORK_OFFLINE', payload: networkState });
    return;
  }

  const { timeout } = yield race({
    networkOnline: take(networkOnlineChan),
    timeout: delay(ACTIVATE_NETWORK_OFFLINE_TIMEOUT),
  });

  if (timeout) {
    yield put({ type: 'APP_STATE_NETWORK_OFFLINE', payload: networkState });
  }
}

function* networkOnlineSaga(networkState) {
  const networkIsOfflineInState = yield select((state) => state.appState.networkIsOffline);

  if (networkIsOfflineInState) {
    yield delay(ACTIVATE_NETWORK_ONLINE_TIMEOUT);
    yield put({ type: 'APP_STATE_NETWORK_ONLINE', payload: networkState });
  }
}

function createNetworkStateChannel() {
  return eventChannel((emit) => {
    const onNetworkStateChanged = (networkState) => {
      emit({
        source: 'netInfoModule',
        ...networkState,
      });
    };

    const onFirebaseConnectionChange = (snap) => {
      if (snap.val() === 1) {
        emit({
          source: 'firebaseConnection',
          type: 'online',
        });
      } else {
        emit({
          source: 'firebaseConnection',
          type: 'none',
        });
      }
    };

    firebase.database().ref('.info/connected').on('value', onFirebaseConnectionChange);

    NetInfo.addEventListener(
      'connectionChange',
      onNetworkStateChanged,
    );

    const unsubscribe = () => {
      firebase.database().ref('.info.connected').off('value', onFirebaseConnectionChange);
      NetInfo.removeEventListener(
        'connectionChange',
        onNetworkStateChanged,
      );
    };

    return unsubscribe;
  });
}
