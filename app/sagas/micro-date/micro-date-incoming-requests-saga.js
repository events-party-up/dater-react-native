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
      const microDateUpdatesTask = yield takeEvery(microDateChannel, incomingMicroDateUpdatedSaga, microDateChannel);

      const task1 = yield fork(incomingMicroDateRequestSaga, nextMicroDate);
      const task2 = yield fork(incomingMicroDateAcceptSaga, nextMicroDate);
      const task3 = yield fork(incomingMicroDateDeclineByMeSaga, nextMicroDate);
      const task4 = yield fork(incomingMicroDateCancelSaga, nextMicroDate);
      const task5 = yield fork(incomingMicroDateStopByMeSaga, nextMicroDate);
      const task6 = yield fork(incomingMicroDateStopByTargetSaga);
      const task7 = yield fork(incomingMicroDateDeclineSelfieByMe, nextMicroDate);
      const task8 = yield fork(incomingMicroDateAcceptSelfieByMe, nextMicroDate);

      const nextAction = yield take([
        'MICRO_DATE_INCOMING_REMOVE',
        'MICRO_DATE_INCOMING_DECLINED_BY_ME',
        'MICRO_DATE_STOPPED',
        'MICRO_DATE_INCOMING_CANCELLED',
        'MICRO_DATE_STOPPED_BY_TARGET',
      ]);

      yield microDateChannel.close();
      yield cancel(microDateUpdatesTask, task1, task2, task3, task4, task5, task6, task7, task8);
      yield console.log('Cancelled tasks & channel');

      if (nextAction.type === 'MICRO_DATE_INCOMING_REMOVE') {
        yield put({ type: 'UI_MAP_PANEL_HIDE_FORCE' });
      }
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_INCOMING_ERROR', payload: error });
  }
}

function* incomingMicroDateUpdatedSaga(microDateChannel, microDate) {
  try {
    if (microDate.error) {
      throw new Error(microDate.error);
    }

    if (microDate.hasNoData) {
      yield put({ type: 'MICRO_DATE_INCOMING_REMOVE' });
      return;
    }

    switch (microDate.status) {
      case 'REQUEST':
        yield put({ type: 'MICRO_DATE_INCOMING_REQUEST', payload: microDate });
        break;
      case 'ACCEPT':
        yield put({ type: 'MICRO_DATE_INCOMING_ACCEPT' });
        break;
      case 'CANCEL_REQUEST':
        yield put({ type: 'MICRO_DATE_INCOMING_CANCEL' });
        break;
      case 'STOP':
        if (microDate.stopBy !== microDate.requestFor) {
          yield put({ type: 'MICRO_DATE_STOP_BY_TARGET', payload: microDate });
        }
        break;
      case 'SELFIE_UPLOADED':
        if (microDate.selfie.uploadedBy === microDate.requestBy) {
          yield put({
            type: 'UI_MAP_PANEL_SHOW',
            payload: {
              mode: 'selfieUploadedByTarget',
              canHide: false,
              microDate,
            },
          });

          yield put({ type: 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET' });
        } else if (microDate.selfie.uploadedBy === microDate.requestFor) {
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
        break;
      default:
        break;
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_HANDLE_INCOMING_ERROR', payload: error });
  }
}

function* incomingMicroDateRequestSaga(microDate) {
  yield take('MICRO_DATE_INCOMING_REQUEST');
  const myCoords = yield select((state) => state.location.coords);
  const userSnap = yield microDate.requestByRef.get();
  const targetUser = {
    id: userSnap.id,
    shortId: userSnap.id.substring(0, 4),
    ...userSnap.data(),
  };

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
}


function* incomingMicroDateAcceptSaga(microDate) {
  const action = yield take('MICRO_DATE_INCOMING_ACCEPT');
  const { acceptType } = action.payload;

  const myCoords = yield select((state) => state.location.coords);
  const userSnap = yield microDate.requestByRef.get();
  const targetUser = {
    id: userSnap.id,
    shortId: userSnap.id.substring(0, 4),
    ...userSnap.data(),
  };

  if (acceptType === 'acceptButtonPressed') {
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        status: 'ACCEPT',
        startDistance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
        acceptTS: firebase.firestore.FieldValue.serverTimestamp(),
      });
  }

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
  yield put({ type: 'MICRO_DATE_INCOMING_ACCEPTED' });
}

function* incomingMicroDateCancelSaga(microDate) {
  yield take('MICRO_DATE_INCOMING_CANCEL');
  yield put({
    type: 'UI_MAP_PANEL_SHOW',
    payload: {
      mode: 'incomingMicroDateCancelled',
      canHide: true,
      microDate,
    },
  });
  yield put({ type: 'MICRO_DATE_INCOMING_CANCELLED' });
}

function* incomingMicroDateDeclineByMeSaga(microDate) {
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

function* incomingMicroDateStopByMeSaga(microDate) {
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
  yield put({ type: 'MICRO_DATE_INCOMING_STOPPED_BY_ME' });
}

function* incomingMicroDateStopByTargetSaga() {
  const action = yield take('MICRO_DATE_STOP_BY_TARGET');
  const microDate = action.payload;

  yield put({
    type: 'UI_MAP_PANEL_SHOW',
    payload: {
      mode: 'microDateStopped',
      canHide: true,
      microDate,
    },
  });
  yield put({ type: 'MICRO_DATE_STOPPED_BY_TARGET' });
}

function* incomingMicroDateDeclineSelfieByMe(microDate) {
  while (true) {
    yield take('MICRO_DATE_DECLINE_SELFIE_BY_ME');
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        status: 'ACCEPT',
      });

    yield put({ type: 'MICRO_DATE_DECLINED_SELFIE_BY_ME' });
  }
}

function* incomingMicroDateAcceptSelfieByMe(microDate) {
  yield take('MICRO_DATE_INCOMING_ACCEPT_SELFIE');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'SELFIE_ACCEPTED',
    });

  yield put({ type: 'MICRO_DATE_INCOMING_ACCEPTED_SELFIE' });
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

