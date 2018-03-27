import { put, take, throttle, select } from 'redux-saga/effects';
import ReactNativeHeading from '@zsajjad/react-native-heading';
import firebase from 'react-native-firebase';

const HEADING_UPDATE_ON_DEGREE_CHANGED = 10;
const getUid = (state) => state.auth.uid;

export default function* compassSaga() {
  yield throttle(5000, 'GEO_COMPASS_HEADING_UPDATE', writeHeadingToFirestore);

  while (true) {
    yield take('GEO_COMPASS_HEADING_START');
    yield* compassStart();
    yield take('GEO_COMPASS_HEADING_STOP', compassStop);
    yield* compassStop();
  }
}

function* compassStart() {
  try {
    const didStart = yield ReactNativeHeading.start(HEADING_UPDATE_ON_DEGREE_CHANGED);
    if (didStart) {
      yield put({ type: 'GEO_COMPASS_HEADING_STARTED' });
    } else {
      yield put({ type: 'GEO_COMPASS_HEADING_UNAVAILABLE' });
    }
  } catch (error) {
    yield put({ type: 'GEO_COMPASS_UNKNOWN_ERROR', payload: error });
  }
}

function* compassStop() {
  try {
    yield ReactNativeHeading.stop();
    yield put({ type: 'GEO_COMPASS_HEADING_STOPPED' });
  } catch (error) {
    yield put({ type: 'GEO_COMPASS_UNKNOWN_ERROR', payload: error });
  }
}

function* writeHeadingToFirestore(action) {
  const heading = action.payload;
  const uid = yield select(getUid);
  if (!uid) return;

  yield firebase.firestore().collection('geoPoints').doc(uid).update({
    compassHeading: heading,
  });
}
