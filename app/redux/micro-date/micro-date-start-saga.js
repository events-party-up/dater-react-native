import { call, take, put, takeEvery, select, cancel, fork, spawn } from 'redux-saga/effects';
import { eventChannel, buffers } from 'redux-saga';
import firebase from 'react-native-firebase';

import { NavigatorActions } from '../../navigators/navigator-actions';
import GeoUtils from '../../utils/geo-utils';
import {
  MICRO_DATES_COLLECTION,
  GEO_POINTS_COLLECTION,
} from '../../constants';
import { MicroDate } from '../../types';

export default function* microDateStartSaga() {
  try {
    const myUid = yield select((state) => state.auth.uid);
    const incomingMicroDateRequestsChannel = yield call(createChannelForActiveMicroDate, myUid);
    const activeMicroDate = yield getActiveMicroDate(myUid);
    const readyToDate = yield getPendingSearchStatus(myUid);
    yield takeEvery('MICRO_DATE_IM_READY', startPendingSearch, myUid);
    yield takeEvery('MICRO_DATE_PENDING_SEARCH_CANCEL', cancelPendingSearch, myUid);

    if (activeMicroDate) {
      console.log('Micro date is already active');
    } else if (readyToDate) {
      yield put({ type: 'MICRO_DATE_IM_READY' });
    } else {
      yield put({ type: 'MICRO_DATE_ASK_ARE_YOU_READY' });
    }

    while (true) {
      const microDate: MicroDate = yield take(incomingMicroDateRequestsChannel);

      if (microDate.error) {
        throw new Error(JSON.stringify(microDate.error));
      }
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_ERROR', payload: error });
  }
}

async function startPendingSearch(uid) {
  await firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(uid)
    .update({
      readyToDate: true,
      readyToDateTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

async function cancelPendingSearch(uid) {
  await firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(uid)
    .update({
      readyToDate: false,
    });
}

function createChannelForActiveMicroDate(uid) {
  const microDateStartedByOthersQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where(`players.${uid}`, '==', true)
    .where('active', '==', true)
    .limit(1);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (snapshot) => {
      if (snapshot.docs.length > 0 && snapshot.docChanges[0].type === 'added') {
        const microDate = snapshot.docs[0].data();
        emit({
          ...microDate,
          id: snapshot.docs[0].id,
        });
      }
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    const unsubscribe = microDateStartedByOthersQuery.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  }, buffers.expanding(1));
}

async function getActiveMicroDate(uid) {
  const microDateQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where(`players.${uid}`, '==', true)
    .where('active', '==', true);
    // .orderBy('startTS');

  const microDatesSnapshot = await microDateQuery.get();
  const microDateSnapshot = microDatesSnapshot.docs[0];
  return microDateSnapshot ? microDateSnapshot.data() : null;
}

async function getPendingSearchStatus(uid) {
  const myGeoPointRef = firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(uid);

  const myGeoPointRefSnap = await myGeoPointRef.get();
  const myGeoPoint = myGeoPointRefSnap.data();
  return myGeoPoint.readyToDate && myGeoPoint.readyToDate === true;
}
