import { takeLatest } from 'redux-saga/effects';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { Vibration } from 'react-native';

// Docs https://facebook.github.io/react-native/docs/vibration.html
// https://github.com/mkuczera/react-native-haptic-feedback

export default function* hapticFeedbackSaga() {
  yield takeLatest([
    'USERS_AROUND_ITEM_PRESSED',
  ], hapticFeedbackSelection);

  yield takeLatest([
    'MICRO_DATE_INCOMING_REQUEST',
    'MICRO_DATE_INCOMING_STOPPED_BY_TARGET',
    'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET',
    'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET',
  ], hapticFeedbackVibrationOnly);

  yield takeLatest([
    'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME',
    'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME',
    'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET',
    'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET',
    'MICRO_DATE_INCOMING_CANCELLED',
    'MICRO_DATE_OUTGOING_ACCEPT',
    'HAPTIC_HEAVY',
  ], hapticFeedbackHeavyImpact);
}

function hapticFeedbackSelection() {
  // ReactNativeHapticFeedback.trigger('impactLight', false);
  ReactNativeHapticFeedback.trigger('selection', false);
  // ReactNativeHapticFeedback.trigger('notificationError', false);
}

function hapticFeedbackVibrationOnly() {
  Vibration.vibrate(300);
}

function hapticFeedbackHeavyImpact() {
  ReactNativeHapticFeedback.trigger('impactHeavy', true);
}
