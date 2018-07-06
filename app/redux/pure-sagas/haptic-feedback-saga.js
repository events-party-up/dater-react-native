import { takeLatest, cancel, take } from 'redux-saga/effects';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Vibration } from 'react-native';

// Docs https://facebook.github.io/react-native/docs/vibration.html
// https://github.com/mkuczera/react-native-haptic-feedback
// Possible values for Hapcit Feedback are
// "selection", "impactLight", "impactMedium", "impactHeavy", "notificationSuccess",
// "notificationWarning", "notificationError"(default: "selection")

export default function* hapticFeedbackSaga() {
  while (true) {
    yield take('APP_STATE_ACTIVE');

    const task1 = yield takeLatest([
      'USERS_AROUND_ITEM_PRESSED',
    ], hapticFeedbackSelection);

    const task2 = yield takeLatest([
      'MICRO_DATE_INCOMING_REQUEST',
      'MICRO_DATE_INCOMING_STOPPED_BY_TARGET',
      'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET',
      'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET',
    ], hapticFeedbackVibrationOnly);

    const task3 = yield takeLatest([
      'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME',
      'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME',
      'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET',
      'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET',
      'MICRO_DATE_INCOMING_CANCELLED',
      'MICRO_DATE_OUTGOING_ACCEPT',
      'HAPTICFEEDBACK_HEAVY',
    ], hapticFeedbackHeavyImpact);

    const task4 = yield takeLatest([
      'AUTH_PHONE_INVALID_NUMBER_ERROR',
      'AUTH_PHONE_NUMBER_UNKNOWN_ERROR',
      'AUTH_PHONE_NUMBER_SEND_SMS_TIMEOUT',
      'AUTH_PHONE_NUMBER_SIGN_IN_WITH_CREDENTIAL_TIMEOUT',
      'AUTH_PHONE_NUMBER_SIGN_IN_WITH_CREDENTIAL_ERROR',
      'HAPTICFEEDBACK_ERROR',
      'APP_STATE_POOR_GPS',
    ], hapticFeedbackError);

    yield take('APP_STATE_BACKGROUND');
    yield cancel(task1, task2, task3, task4);
  }
}

function hapticFeedbackSelection() {
  ReactNativeHapticFeedback.trigger('selection', false);
}

function hapticFeedbackVibrationOnly() {
  Vibration.vibrate(300);
}

function hapticFeedbackHeavyImpact() {
  ReactNativeHapticFeedback.trigger('impactHeavy', true);
}

function hapticFeedbackError() {
  ReactNativeHapticFeedback.trigger('notificationError', false);
}
