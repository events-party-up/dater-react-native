import { put, take, throttle, select, call, takeEvery } from 'redux-saga/effects';
import ReactNativeHeading from '@zsajjad/react-native-heading';
import { eventChannel } from 'redux-saga';
import { DeviceEventEmitter } from 'react-redux';
import { NativeEventEmitter } from 'react-native';

import { updateFirestore } from '../utils/firebase-utils';

const HEADING_UPDATE_ON_DEGREE_CHANGED = 10;
const getUid = (state) => state.auth.uid;

export default function* compassSaga() {
  const compassChannel = yield call(createCompassChannel);
  yield takeEvery(compassChannel, updateCompassHeading);
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
    const didStart = yield call([ReactNativeHeading, 'start'], HEADING_UPDATE_ON_DEGREE_CHANGED);
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
    yield call([ReactNativeHeading, 'stop']);
    yield put({ type: 'GEO_COMPASS_HEADING_STOPPED' });
  } catch (error) {
    yield put({ type: 'GEO_COMPASS_UNKNOWN_ERROR', payload: error });
  }
}

function* updateCompassHeading(heading) {
  yield put({ type: 'GEO_COMPASS_HEADING_UPDATE', payload: heading });
}

function* writeHeadingToFirestore(action) {
  const heading = action.payload;
  const uid = yield select(getUid);
  if (!uid) return;

  yield call(updateFirestore, {
    collection: 'geoPoints',
    doc: uid,
    data: {
      compassHeading: heading,
    },
  });
}

function createCompassChannel() {
  const compassListener = new NativeEventEmitter(ReactNativeHeading);

  return eventChannel((emit) => {
    const onHeadingUpdated = (heading) => {
      emit(heading);
    };

    compassListener.addListener('headingUpdated', onHeadingUpdated);

    // this will be invoked when the saga calls `channel.close` method
    const unsubscribe = () => {
      DeviceEventEmitter.removeAllListeners('headingUpdated');
    };
    return unsubscribe;
  });
}
