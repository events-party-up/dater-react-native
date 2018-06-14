import { put, takeEvery, call, take, race } from 'redux-saga/effects';
import { eventChannel, delay } from 'redux-saga';

import {
  AppState,
  Platform,
} from 'react-native';

import { APP_STATE_ACTIVATE_BACKGROUND_MODE_AFTER } from '../../constants';

export default function* appStateSaga() {
  try {
    const appStateChannel = yield call(createAppStateChannel);
    if (Platform.OS === 'android') {
      yield* updateStateSaga('unknown'); // initialize state on app start
    } else {
      yield* updateStateSaga(AppState.currentState); // initialize state on app start
    }
    yield takeEvery(appStateChannel, updateStateSaga);
  } catch (error) {
    yield put({ type: 'APP_STATE_ERROR', payload: error });
  }
}

function* updateStateSaga(nextAppState) {
  switch (nextAppState) {
    case 'active':
      yield put({ type: 'APP_STATE_ACTIVE', payload: nextAppState });
      break;
    case 'background': // eslint-disable-line
      // don't put app immediately in background mode, delay and wait for active state, good for quick app switching
      const { appIsActive } = yield race({
        timeout: delay(APP_STATE_ACTIVATE_BACKGROUND_MODE_AFTER),
        appIsActive: take('APP_STATE_ACTIVE'),
      });
      if (appIsActive) {
        return;
      }
      yield put({ type: 'APP_STATE_BACKGROUND', payload: nextAppState });
      break;
    case 'inactive':
      yield put({ type: 'APP_STATE_INACTIVE', payload: nextAppState });
      break;
    default:
      yield put({ type: 'APP_STATE_UNKNOWN', payload: nextAppState });
      break;
  }
}

function createAppStateChannel() {
  return eventChannel((emit) => {
    const onStateChanged = (nextAppState) => {
      emit(nextAppState);
    };
    AppState.addEventListener('change', onStateChanged);
    const unsubscribe = () => AppState.removeEventListener('change', onStateChanged);

    return unsubscribe;
  });
}
