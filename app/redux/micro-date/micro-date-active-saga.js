import { take, put, select, cancel, fork, spawn, takeLatest } from 'redux-saga/effects';
import { eventChannel, buffers } from 'redux-saga';
import firebase from 'react-native-firebase';
import { pickBy } from 'lodash';

import { getFirestoreDocData } from '../../utils/firebase-utils';
import {
  MICRO_DATES_COLLECTION,
  GEO_POINTS_COLLECTION,
  GEO_POINTS_PAST_MICRO_DATES_COLLECTION,
} from '../../constants';
import { MicroDate } from '../../types';
import { NavigatorActions } from '../../navigators/navigator-actions';
import DaterBackgroundGeolocation from '../../services/background-geolocation';

export default function* microDateActiveSaga() {
  try {
    const myUid = yield select((state) => state.auth.uid);
    const activeMicroDateChan = yield createChannelForActiveMicroDate(myUid);

    while (true) {
      const microDate: MicroDate = yield take(activeMicroDateChan);

      if (microDate.error) {
        throw new Error(JSON.stringify(microDate.error));
      }

      const task1 = yield fork(restoreMicroDateStatusOnAppLaunchSaga);
      const task2 = yield fork(microDateStopByMeSaga, microDate);
      const task3 = yield fork(microDateSelfieDeclineByMeSaga, microDate);
      const task4 = yield fork(microDateSelfieAcceptByMeSaga, microDate);
      const task5 = yield fork(microDateFinishedSaga);

      const microDateChan = yield createChannelToMicroDate(myUid, microDate.id);
      const microDateUpdatesTask = yield takeLatest(microDateChan, microDateUpdatedSaga);

      const stopAction = yield take([
        'MICRO_DATE_EXPIRED',
        'MICRO_DATE_REMOVE',
        'MICRO_DATE_STOPPED_BY_TARGET',
        'MICRO_DATE_STOPPED_BY_ME',
        'MICRO_DATE_FINISH',
      ]);

      yield DaterBackgroundGeolocation.updateHttpParams({
        microDate: {
          enabled: false,
          microDateId: null,
        },
      });

      yield put({ type: 'MICRO_DATE_SAGA_CANCEL_TASKS' });
      yield microDateChan.close();
      yield cancel(microDateUpdatesTask);
      yield cancel(task1, task2, task3, task4, task5);

      if (stopAction.type !== 'MICRO_DATE_STOPPED_BY_TARGET' &&
          stopAction.type !== 'MICRO_DATE_EXPIRED') {
        yield put({ type: 'MICRO_DATE_ASK_ARE_YOU_READY' });
      }
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_ACTIVE_ERROR', payload: error });
  }
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

function* restoreMicroDateStatusOnAppLaunchSaga() {
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
  yield DaterBackgroundGeolocation.updateHttpParams({
    microDate: {
      enabled: true,
      microDateId: microDate.id,
    },
  });
  yield put({
    type: 'MICRO_DATE_START',
    payload: {
      ...yield microDatePayload(myUid, microDate),
    },
  });
  yield put({ type: 'GEO_LOCATION_FORCE_UPDATE' });
  yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION' });
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
  while (true) {
    yield take('MICRO_DATE_DECLINE_SELFIE_BY_ME');
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        status: 'SELFIE_DECLINED',
        declinedSelfieBy: microDate.currentUser.uid,
        selfie: null,
      });
  }
}

function* microDateSelfieAcceptByMeSaga(microDate: MicroDate) {
  yield take('MICRO_DATE_APPROVE_SELFIE');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'FINISHED',
      active: false,
      finishTS: firebase.firestore.FieldValue.serverTimestamp(),
      finishBy: microDate.currentUser.uid,
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

function writeFinishedStateFor(microDate) {
  return firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(microDate.currentUser.uid)
    .collection(GEO_POINTS_PAST_MICRO_DATES_COLLECTION)
    .doc(microDate.targetUser.uid)
    .set({
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    });
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

function* microDateUpdatedSaga(microDate) {
  try {
    if (microDate.error) {
      throw new Error(JSON.stringify(microDate.error));
    }

    if (microDate.hasNoData) {
      yield put({ type: 'MICRO_DATE_REMOVE' });
      return;
    }

    const myUid = microDate.currentUser.uid;

    switch (microDate.status) {
      case 'START':
        yield startMicroDateSaga(microDate);
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
      case 'STOP':
        if (microDate.stopBy !== myUid) {
          yield put({ type: 'MICRO_DATE_STOPPED_BY_TARGET', payload: microDate });
        }
        break;
      case 'EXPIRED':
        yield put({ type: 'MICRO_DATE_EXPIRED', payload: microDate });
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
  return Object.keys(pickBy(microDate.players, (item, uid) => uid !== myUid))[0];
}
