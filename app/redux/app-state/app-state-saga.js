import { put, takeLatest, call, fork } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';

import {
  AppState,
  Platform,
} from 'react-native';

export default function* appStateSaga() {
  try {
    const appStateChannel = yield call(createAppStateChannel);
    if (Platform.OS === 'android') {
      yield fork(updateStateSaga, 'unknown'); // initialize state on app start
    } else {
      yield fork(updateStateSaga, AppState.currentState); // initialize state on app start
    }
    yield takeLatest(appStateChannel, updateStateSaga);
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
