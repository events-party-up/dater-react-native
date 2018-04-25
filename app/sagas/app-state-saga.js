import { put, takeEvery, call } from 'redux-saga/effects';
import { AppState } from 'react-native';
import { eventChannel } from 'redux-saga';

export default function* appStateSaga() {
  const appStateChannel = yield call(createAppStateChannel);
  yield takeEvery(appStateChannel, updateStateSaga);
}

function* updateStateSaga(nextAppState) {
  switch (nextAppState) {
    case 'active':
      yield put({ type: 'APP_STATE_ACTIVE', payload: nextAppState });
      break;
    case 'background':
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
