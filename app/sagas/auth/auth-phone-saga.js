import { take, cancel, takeEvery, put, fork } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';
import { Alert } from 'react-native';

import { Actions } from '../../navigators/navigator-actions';

export default function* authPhoneSaga() {
  while (true) {
    const startAction = yield take('AUTH_PHONE_NUMBER_VERIFY');
    const authPhoneChannel = yield createAuthPhoneChannel(startAction.payload.phoneNumber);
    const authPhoneStateChannel = yield takeEvery(authPhoneChannel, authPhoneStatesSaga);

    const task1 = yield fork(authPhoneCodeSentSaga);

    const stopAction = yield take([
      'AUTH_SUCCESS',
      'AUTH_PHONE_INVALID_NUMBER_ERROR',
      'AUTH_PHONE_NUMBER_UNKNOWN_ERROR',
      'BACK_BUTTON_PRESSED',
      'AUTH_PHONE_NUMBER_SMS_CODE_SCREEN_BACK_BUTTON',
    ]);

    if (stopAction.type === 'AUTH_SUCCESS') {
      yield Actions.navigate({ routeName: 'GenderScreen' });
    } else if (stopAction.type !== 'AUTH_PHONE_NUMBER_SMS_CODE_SCREEN_BACK_BUTTON') {
      Alert.alert(
        'Что то пошло не так',
        stopAction.payload ? stopAction.payload.nativeErrorMessage : '',
        [
          { text: 'ОК' },
        ],
      );
    }
    yield cancel(authPhoneStateChannel);
    yield cancel(task1);
    yield authPhoneChannel.close();
    yield put({ type: 'AUTH_PHONE_NUMBER_TASKS_STOPPED', payload: stopAction.type });
  }
}

function* authPhoneCodeSentSaga() {
  const codeSentAction = yield take('AUTH_PHONE_NUMBER_CODE_SENT');
  yield Actions.navigate({ routeName: 'SmsCode' });
  const { verificationId } = codeSentAction.payload;
  yield takeEvery('AUTH_PHONE_NUMBER_SMS_CODE_SUBMITTED', authPhoneCodeSubmittedSaga, verificationId);
}

function* authPhoneCodeSubmittedSaga(verificationId, action) {
  try {
    const { smsCode } = action.payload;
    const authCredentials = firebase.auth.PhoneAuthProvider.credential(
      verificationId,
      smsCode,
    );
    const currentUser = yield firebase.auth().signInAndRetrieveDataWithCredential(authCredentials);
    yield put({ type: 'AUTH_PHONE_NUMBER_SIGN_IN_WITH_CREDENTIAL', payload: currentUser });
  } catch (error) {
    Alert.alert(
      'Неверный СМС код',
      'Введен неверный код из СМС, 6 цифр',
      [
        { text: 'Исправлюсь!' },
      ],
    );
    yield put({ type: 'AUTH_PHONE_NUMBER_SIGN_IN_WITH_CREDENTIAL_ERROR', payload: error });
  }
}

function* authPhoneStatesSaga(phoneAuthSnapshot) {
  try {
    // yield console.log(phoneAuthSnapshot);

    // How you handle these state events is entirely up to your ui flow and whether
    // you need to support both ios and android. In short: not all of them need to
    // be handled - it's entirely up to you, your ui and supported platforms.

    // E.g you could handle android specific events only here, and let the rest fall back
    // to the optionalErrorCb or optionalCompleteCb functions
    switch (phoneAuthSnapshot.state) {
      // ------------------------
      //  IOS AND ANDROID EVENTS
      // ------------------------
      case firebase.auth.PhoneAuthState.CODE_SENT: // or 'sent'
        yield put({ type: 'AUTH_PHONE_NUMBER_CODE_SENT', payload: phoneAuthSnapshot });

        // on ios this is the final phone auth state event you'd receive
        // so you'd then ask for user input of the code and build a credential from it
        // as demonstrated in the `signInWithPhoneNumber` example above

        // Platform specific logic:
        // - if this is on IOS then phoneAuthSnapshot.code will always be null
        // - if ANDROID auto verified the sms code then phoneAuthSnapshot.code will contain the verified sms code
        //   and there'd be no need to ask for user input of the code - proceed to credential creating logic
        // - if ANDROID auto verify timed out then phoneAuthSnapshot.code would be null, just like ios, you'd
        //   continue with user input logic.

        break;
      case firebase.auth.PhoneAuthState.ERROR: // or 'error'
        if (phoneAuthSnapshot.error.nativeErrorMessage === 'Invalid format.') {
          yield put({ type: 'AUTH_PHONE_INVALID_NUMBER_ERROR', payload: phoneAuthSnapshot.error });
        } else {
          yield put({ type: 'AUTH_PHONE_NUMBER_UNKNOWN_ERROR', payload: phoneAuthSnapshot.error });
        }
        break;
      // ---------------------
      // ANDROID ONLY EVENTS
      // ---------------------
      case firebase.auth.PhoneAuthState.AUTO_VERIFY_TIMEOUT: // or 'timeout'
        console.log('auto verify on android timed out');
        // proceed with your manual code input flow, same as you would do in
        // CODE_SENT if you were on IOS
        break;
      case firebase.auth.PhoneAuthState.AUTO_VERIFIED: // or 'verified'
        // auto verified means the code has also been automatically confirmed as correct/received
        // phoneAuthSnapshot.code will contain the auto verified sms code - no need to ask the user for input.
        console.log('auto verified on android');
        // Example usage if handling here and not in optionalCompleteCb:
        // const { verificationId, code } = phoneAuthSnapshot;
        // const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);

        // Do something with your new credential, e.g.:
        // firebase.auth().signInWithCredential(credential);
        // firebase.auth().currentUser.linkWithCredential(credential);
        // etc ...
        break;
      default:
        console.log('Unknown state: ', phoneAuthSnapshot.state);
        break;
    }
  } catch (error) {
    yield put({ type: 'AUTH_PHONE_NUMBER_ERROR', payload: error });
  }
}

function createAuthPhoneChannel(phoneNumber: string) {
  return eventChannel((emit) => {
    const onVerifyPhoneStateChanged = (phoneAuthSnapshot) => {
      emit(phoneAuthSnapshot);
    };

    firebase.auth()
      .verifyPhoneNumber(phoneNumber)
      .on('state_changed', onVerifyPhoneStateChanged);

    return () => { };
  });
}
