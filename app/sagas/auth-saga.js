import { throttle, takeEvery } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';

export default function* authSaga() {
  yield console.log('auth saga started');
}

function createAuthStateChannel() {
  return eventChannel((emit) => {
    const onAuthStateChanged = (user) => {
      emit(user);
    };

    const unsubscribe = firebase.auth().onAuthStateChanged(onAuthStateChanged);
    return unsubscribe;
  });
}
