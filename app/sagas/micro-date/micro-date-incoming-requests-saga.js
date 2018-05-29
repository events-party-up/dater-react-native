import { call, take, put, takeEvery, select, cancel, fork } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import GeoUtils from '../../utils/geo-utils';
import { MICRO_DATES_COLLECTION } from '../../constants';

export default function* microDateIncomingRequestsSaga() {
  try {
    const myUid = yield select((state) => state.auth.uid);
    const incomingMicroDateRequestsChannel = yield call(createChannelForIncomingMicroDateRequests, myUid);
    // let microDateUpdatesTask;
    // let microDateChannel;

    while (true) {
      const nextMicroDate = yield take(incomingMicroDateRequestsChannel);

      if (nextMicroDate.error) {
        throw new Error(nextMicroDate.error);
      }

      const microDateChannel = yield call(createChannelToMicroDate, nextMicroDate.id);
      const microDateUpdatesTask = yield takeEvery(microDateChannel, handleIncomingMicroDate, microDateChannel);
      const task1 = yield fork(handleMicroDateStop, nextMicroDate);
      const task2 = yield fork(handleIncomingMicroDateDeclineByMe, nextMicroDate);
      const task3 = yield fork(handleIncomingMicroDateAccept, nextMicroDate);

      const nextAction = yield take([
        'MICRO_DATE_INCOMING_REMOVE',
        'MICRO_DATE_INCOMING_DECLINED_BY_ME',
        'MICRO_DATE_STOPPED',
        'MICRO_DATE_INCOMING_CANCELLED',
        'MICRO_DATE_STOPPED_BY_TARGET',
      ]);

      yield microDateChannel.close();
      yield cancel(microDateUpdatesTask, task1, task2, task3);
      yield console.log('Cancelled tasks & channel');

      if (nextAction.type === 'MICRO_DATE_INCOMING_REMOVE') {
        yield put({ type: 'UI_MAP_PANEL_HIDE_FORCE' });
      }
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_INCOMING_ERROR', payload: error });
  }
}

function* handleIncomingMicroDateDeclineByMe(microDate) {
  yield take('MICRO_DATE_INCOMING_DECLINE_BY_ME');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'DECLINE',
      declineTS: firebase.firestore.FieldValue.serverTimestamp(),
      active: false,
    });
  yield put({ type: 'MICRO_DATE_INCOMING_DECLINED_BY_ME' });
}

function* handleMicroDateStop(microDate) {
  yield take('MICRO_DATE_STOP');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'STOP',
      active: false,
      stopBy: microDate.requestFor,
      stopTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
  yield put({ type: 'MICRO_DATE_STOPPED' });
}

function* handleIncomingMicroDateAccept(microDate) {
  const userSnap = yield microDate.requestByRef.get();
  const myCoords = yield select((state) => state.location.coords);

  yield take('MICRO_DATE_INCOMING_ACCEPT');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'ACCEPT',
      startDistance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
      acceptTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
}

function* handleIncomingMicroDate(microDateChannel, microDate) {
  try {
    if (microDate.error) {
      throw new Error(microDate.error);
    }

    if (microDate.hasNoData) {
      yield put({ type: 'MICRO_DATE_INCOMING_REMOVE' });
      return;
    }

    const myCoords = yield select((state) => state.location.coords);
    const userSnap = yield microDate.requestByRef.get();
    const targetUser = {
      id: userSnap.id,
      shortId: userSnap.id.substring(0, 4),
      ...userSnap.data(),
    };

    if (microDate.status === 'REQUEST') {
      yield put({ type: 'MICRO_DATE_INCOMING_REQUEST', payload: microDate });
      yield put({
        type: 'UI_MAP_PANEL_SHOW',
        payload: {
          mode: 'incomingMicroDateRequest',
          targetUser,
          distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
          canHide: false,
          microDateId: microDate.id,
        },
      });
    } else if (microDate.status === 'ACCEPT') {
      yield put({ type: 'MICRO_DATE_INCOMING_ACCEPTED' });
      yield put({
        type: 'MICRO_DATE_INCOMING_START',
        payload: {
          targetUser,
          myCoords,
          distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
          microDateId: microDate.id,
        },
      });

      yield put({
        type: 'UI_MAP_PANEL_SHOW',
        payload: {
          canClose: true,
          mode: 'activeMicroDate',
          distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
        },
      });
    } else if (microDate.status === 'CANCEL_REQUEST') {
      yield put({
        type: 'UI_MAP_PANEL_SHOW',
        payload: {
          mode: 'incomingMicroDateCancelled',
          canHide: true,
          microDate,
        },
      });
      yield put({ type: 'MICRO_DATE_INCOMING_CANCELLED' });
    } else if (microDate.status === 'STOP' && microDate.stopBy !== microDate.requestFor) {
      yield put({
        type: 'UI_MAP_PANEL_SHOW',
        payload: {
          mode: 'microDateStopped',
          canHide: true,
          microDate,
        },
      });
      yield put({ type: 'MICRO_DATE_STOPPED_BY_TARGET' });
    } else if (microDate.status === 'SELFIE_UPLOADED' && microDate.selfie.uploadedBy === microDate.requestBy) {
      yield put({
        type: 'UI_MAP_PANEL_SHOW',
        payload: {
          mode: 'selfieUploadedByTarget',
          canHide: false,
          microDate,
        },
      });

      yield put({ type: 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET' });
      const nextAction = yield take([
        'MICRO_DATE_DECLINE_SELFIE_BY_ME',
        'MICRO_DATE_INCOMING_ACCEPT_SELFIE',
      ]);
      if (nextAction.type === 'MICRO_DATE_DECLINE_SELFIE_BY_ME') {
        yield firebase.firestore()
          .collection(MICRO_DATES_COLLECTION)
          .doc(microDate.id)
          .update({
            status: 'ACCEPT',
          });
      }
    } else if (microDate.status === 'SELFIE_UPLOADED' && microDate.selfie.uploadedBy === microDate.requestFor) {
      yield put({
        type: 'UI_MAP_PANEL_SHOW',
        payload: {
          mode: 'selfieUploadedByMe',
          canHide: false,
          microDate,
        },
      });

      yield put({ type: 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME' });
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_HANDLE_INCOMING_ERROR', payload: error });
  }
}

function createChannelForIncomingMicroDateRequests(uid) {
  const microDateStartedByOthersQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where('requestFor', '==', uid)
    .where('active', '==', true)
    .orderBy('requestTS')
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
  });
}

function createChannelToMicroDate(microDateId) {
  const microDateQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDateId);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (dataSnapshot) => {
      console.log('Microdate updated: ', dataSnapshot);
      // do not process local updates triggered by local writes
      // if (dataSnapshot.metadata.hasPendingWrites) {
      //   return;
      // }

      emit({
        ...dataSnapshot.data(),
        hasNoData: typeof dataSnapshot.data() === 'undefined',
        id: dataSnapshot.id,
      });
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    const unsubscribe = microDateQuery.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  });
}

