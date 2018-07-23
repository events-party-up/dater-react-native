import { take, put, takeEvery, select, cancel, fork, spawn, takeLatest } from 'redux-saga/effects';
import { eventChannel, buffers } from 'redux-saga';
import firebase from 'react-native-firebase';
import * as _ from 'lodash';

import {
  MICRO_DATES_COLLECTION,
  GEO_POINTS_COLLECTION,
  GEO_POINTS_PAST_MICRO_DATES_COLLECTION,
} from '../../constants';
import { MicroDate } from '../../types';
import { getFirestoreDocData } from '../../utils/firebase-utils';
import { NavigatorActions } from '../../navigators/navigator-actions';

export default function* microDateStartSaga() {
  try {
    const myUid = yield select((state) => state.auth.uid);
    const newMicroDateChannel = yield createChannelForActiveMicroDate(myUid);
    const activeMicroDate = yield getActiveMicroDate(myUid);
    const readyToDate = yield getPendingSearchStatus(myUid);

    yield takeEvery('MICRO_DATE_IM_READY', startPendingSearch, myUid);
    yield fork(cancelPendingSearch, myUid);

    if (readyToDate && !activeMicroDate) {
      yield put({ type: 'MICRO_DATE_IM_READY' });
    } else if (!activeMicroDate) {
      yield put({ type: 'MICRO_DATE_ASK_ARE_YOU_READY' });
    }

    while (true) {
      const microDate: MicroDate = yield take(newMicroDateChannel);

      if (microDate.error) {
        throw new Error(JSON.stringify(microDate.error));
      }
      const task1 = yield fork(restoreMicroDateOnAppLaunchSaga);
      const task2 = yield fork(microDateStopByMeSaga, microDate);
      const task3 = yield fork(microDateSelfieDeclineByMeSaga, microDate);
      const task4 = yield fork(microDateSelfieAcceptByMeSaga, microDate);
      const task5 = yield fork(microDateFinishedSaga);

      const microDateChannel = yield createChannelToMicroDate(myUid, microDate.id);
      const microDateUpdatesTask = yield takeLatest(microDateChannel, microDateUpdatedSaga);

      const stopAction = yield take([
        'MICRO_DATE_REMOVE',
        'MICRO_DATE_STOPPED_BY_TARGET',
        'MICRO_DATE_STOPPED_BY_ME',
        'MICRO_DATE_FINISH',
      ]);

      yield put({ type: 'MICRO_DATE_SAGA_CANCEL_TASKS' });
      yield microDateChannel.close();
      yield cancel(microDateUpdatesTask);
      yield cancel(task1, task2, task3, task4, task5);

      if (stopAction.type !== 'MICRO_DATE_STOPPED_BY_TARGET') {
        yield put({ type: 'MICRO_DATE_ASK_ARE_YOU_READY' });
      }
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_ERROR', payload: error });
  }
}

function* microDateUpdatedSaga(microDate) {
  try {
    const myUid = yield select((state) => state.auth.uid);

    if (microDate.error) {
      throw new Error(JSON.stringify(microDate.error));
    }

    if (microDate.hasNoData) {
      yield put({ type: 'MICRO_DATE_REMOVE' });
      return;
    }

    switch (microDate.status) {
      case 'START':
        yield put({ type: 'MICRO_DATE_START', payload: microDate });
        break;
      case 'STOP':
        if (microDate.stopBy !== myUid) {
          yield put({ type: 'MICRO_DATE_STOPPED_BY_TARGET', payload: microDate });
        }
        break;
      case 'SELFIE_UPLOADED':
        if (microDate.selfie.uploadedBy !== myUid) {
          yield put({ type: 'MICRO_DATE_SELFIE_UPLOADED_BY_TARGET', payload: microDate });
        } else if (microDate.selfie.uploadedBy === myUid) {
          yield put({ type: 'MICRO_DATE_SELFIE_UPLOADED_BY_ME', payload: microDate });
        }
        break;
      case 'SELFIE_DECLINED':
        if (microDate.declinedSelfieBy !== myUid) {
          yield put({ type: 'MICRO_DATE_SELFIE_DECLINED_BY_TARGET', payload: microDate });
        } else if (microDate.declinedSelfieBy === myUid) {
          yield put({ type: 'MICRO_DATE_SELFIE_DECLINED_BY_ME', payload: microDate });
        }
        break;
      case 'FINISHED':
        yield put({ type: 'MICRO_DATE_FINISH', payload: microDate });
        break;
      default:
        yield put({
          type: 'MICRO_DATE_UPDATED_SAGA_UNKNOWN_STATUS_ERROR',
          payload: `Unknown microDate status: ${microDate.status}`,
        });
        break;
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_UPDATED_SAGA_ERROR', payload: error });
  }
}

async function startPendingSearch(myUid) {
  await firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(myUid)
    .update({
      readyToDate: true,
      readyToDateTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

function* cancelPendingSearch(myUid) {
  while (true) {
    yield take([
      'MICRO_DATE_PENDING_SEARCH_CANCEL',
      'MICRO_DATE_STOPPED_BY_ME',
      'MICRO_DATE_STOPPED_BY_TARGET',
      'MICRO_DATE_REMOVE',
      'MICRO_DATE_FINISH',
    ]);
    yield firebase.firestore()
      .collection(GEO_POINTS_COLLECTION)
      .doc(myUid)
      .update({
        readyToDate: false,
      });
    yield put({ type: 'MICRO_DATE_ASK_ARE_YOU_READY' });
  }
}

function* microDateStopByMeSaga(microDate: MicroDate) {
  yield take('MICRO_DATE_STOP');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'STOP',
      active: false,
      stopBy: microDate.currentUser.uid,
      stopTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
  yield put({ type: 'MICRO_DATE_STOPPED_BY_ME' });
}

function* microDateSelfieDeclineByMeSaga(microDate: MicroDate) {
  const myUid = yield select((state) => state.auth.uid);

  while (true) {
    yield take('MICRO_DATE_DECLINE_SELFIE_BY_ME');
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        status: 'SELFIE_DECLINED',
        declinedSelfieBy: myUid,
        selfie: null,
      });
  }
}

function* microDateSelfieAcceptByMeSaga(microDate: MicroDate) {
  const myUid = yield select((state) => state.auth.uid);

  yield take('MICRO_DATE_APPROVE_SELFIE');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'FINISHED',
      active: false,
      finishTS: firebase.firestore.FieldValue.serverTimestamp(),
      finishBy: myUid,
      moderationStatus: 'PENDING',
    });
  yield put({ type: 'MICRO_DATE_APPROVED_SELFIE' });
}

function* microDateFinishedSaga() {
  const action = yield take('MICRO_DATE_FINISH');
  const microDate = action.payload;

  yield spawn(writeFinishedStateFor, microDate);

  yield NavigatorActions.navigate({
    key: 'MicroDateScreen',
    routeName: 'MicroDateScreen',
    params: { microDate },
  });
  yield put({ type: 'MICRO_DATE_FINISHED' });
}

function* writeFinishedStateFor(microDate) {
  const myUid = yield select((state) => state.auth.uid);

  yield firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(myUid)
    .collection(GEO_POINTS_PAST_MICRO_DATES_COLLECTION)
    .doc(getTargetUidFrom(microDate, myUid))
    .set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

function createChannelForActiveMicroDate(myUid) {
  const microDateStartedByOthersQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where(`players.${myUid}`, '==', true)
    .where('active', '==', true)
    .limit(1);

  return eventChannel((emit) => {
    const onSnapshotUpdated = async (snapshot) => {
      if (snapshot.docs.length > 0 && snapshot.docChanges[0].type === 'added') {
        const microDate = snapshot.docs[0].data();

        emit(await microDatePayload(myUid, microDate));
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

async function getActiveMicroDate(myUid) {
  const microDateQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where(`players.${myUid}`, '==', true)
    .where('active', '==', true);
    // .orderBy('startTS');

  const microDatesSnapshot = await microDateQuery.get();
  const microDateSnapshot = microDatesSnapshot.docs[0];
  return microDateSnapshot ? microDatePayload(myUid, microDateSnapshot.data()) : null;
}

async function getPendingSearchStatus(myUid) {
  const myGeoPointRef = firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(myUid);

  const myGeoPointRefSnap = await myGeoPointRef.get();
  const myGeoPoint = myGeoPointRefSnap.data();
  return myGeoPoint.readyToDate && myGeoPoint.readyToDate === true;
}

function* restoreMicroDateOnAppLaunchSaga() {
  while (true) {
    const action = yield take([
      'MICRO_DATE_SELFIE_UPLOADED_BY_ME',
      'MICRO_DATE_SELFIE_UPLOADED_BY_TARGET',
      'MICRO_DATE_SELFIE_DECLINED_BY_TARGET',
      'MICRO_DATE_SELFIE_DECLINED_BY_ME',
    ]);
    const microDate = action.payload;
    const isMicroDateMode = yield select((state) => state.microDate.enabled);
    if (!isMicroDateMode) yield* startMicroDateSaga(microDate);
  }
}

function* startMicroDateSaga(microDate) {
  const myUid = yield select((state) => state.auth.uid);
  yield put({
    type: 'MICRO_DATE_START',
    payload: {
      ...yield microDatePayload(myUid, microDate),
    },
  });
  yield put({ type: 'GEO_LOCATION_FORCE_UPDATE' });
  yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION' });
}

async function microDatePayload(myUid, microDate) {
  if (!myUid || !microDate) return {};

  const targetUserUid = getTargetUidFrom(microDate, myUid);
  return {
    ...microDate,
    targetUser: {
      uid: targetUserUid,
      ...await getFirestoreDocData({ collection: GEO_POINTS_COLLECTION, doc: targetUserUid }),
    },
    currentUser: {
      uid: myUid,
      ...await getFirestoreDocData({ collection: GEO_POINTS_COLLECTION, doc: myUid }),
    },
  };
}

function getTargetUidFrom(microDate, myUid) {
  return Object.keys(_.pickBy(microDate.players, (item, uid) => uid !== myUid))[0];
}

function createChannelToMicroDate(myUid, microDateId) {
  const microDateQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDateId);

  return eventChannel((emit) => {
    const onSnapshotUpdated = async (dataSnapshot) => {
      const microDate = dataSnapshot.data();
      emit({
        hasNoData: typeof microDate === 'undefined',
        ...await microDatePayload(myUid, microDate),
      });
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    const unsubscribe = microDateQuery.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  }, buffers.sliding(1));
}
