import { call, take, put, takeLatest, select, cancel, fork } from 'redux-saga/effects';
import { eventChannel, buffers } from 'redux-saga';
import firebase from 'react-native-firebase';
import GeoUtils from '../../utils/geo-utils';

import { Actions } from '../../navigators/navigator-actions';
import { MICRO_DATES_COLLECTION } from '../../constants';
import { MicroDate } from '../../types';

export default function* microDateOutgoingRequestsSaga() {
  try {
    const myUid = yield select((state) => state.auth.uid);
    const outgoingMicroDateRequestsChannel = yield call(createChannelForOutgoingMicroDateRequests, myUid);

    yield fork(outgoingMicroDateRequestInitSaga);

    while (true) {
      const microDate: MicroDate = yield take(outgoingMicroDateRequestsChannel);
      if (microDate.error) {
        throw new Error(JSON.stringify(microDate.error));
      }

      const task1 = yield fork(outgoingMicroDateCancelSaga, microDate);

      const task2 = yield fork(outgoingMicroDateAcceptSaga);

      const task3 = yield fork(outgoingMicroDateStopByMeSaga, microDate);

      const task4 = yield fork(outgoingMicroDateSelfieUploadedByMeSaga);
      const task5 = yield fork(outgoingMicroDateSelfieUploadedByTargetSaga);

      const task6 = yield fork(outgoingMicroDateSelfieDeclineByMeSaga, microDate);
      const task7 = yield fork(outgoingMicroDateSelfieAcceptByMeSaga, microDate);
      const task8 = yield fork(outgoingMicroDateFinishedSaga);

      const microDateChannel = yield call(createChannelToMicroDate, microDate.id);
      const microDateUpdatesTask = yield takeLatest(microDateChannel, handleOutgoingRequestsSaga);

      yield take([
        'MICRO_DATE_OUTGOING_REMOVE',
        'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET',
        'MICRO_DATE_OUTGOING_CANCELLED',
        'MICRO_DATE_OUTGOING_STOPPED_BY_ME',
        'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET',
        'MICRO_DATE_OUTGOING_FINISHED',
      ]);
      yield put({ type: 'MICRO_DATE_OUTGOING_SAGA_CANCEL_TASKS' });
      yield cancel(task1, task2, task3, task4, task5, task6, task7, task8);
      yield cancel(microDateUpdatesTask);
      yield microDateChannel.close();
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_OUTGOING_ERROR', payload: error });
  }

  function* handleOutgoingRequestsSaga(microDate) {
    if (microDate.error) {
      throw new Error(JSON.stringify(microDate.error));
    }

    if (microDate.hasNoData) {
      yield put({ type: 'MICRO_DATE_OUTGOING_REMOVE' });
      return;
    }

    switch (microDate.status) {
      case 'REQUEST':
        yield put({ type: 'MICRO_DATE_OUTGOING_REQUEST', payload: microDate });
        break;
      case 'DECLINE':
        yield put({ type: 'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET' });
        break;
      case 'ACCEPT':
        yield put({ type: 'MICRO_DATE_OUTGOING_ACCEPT', payload: microDate });
        break;
      case 'STOP':
        if (microDate.stopBy !== microDate.requestBy) {
          yield put({ type: 'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET', payload: microDate });
        }
        break;
      case 'SELFIE_UPLOADED':
        if (microDate.selfie.uploadedBy === microDate.requestBy) {
          yield put({ type: 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME', payload: microDate });
        } else if (microDate.selfie.uploadedBy !== microDate.requestBy) {
          yield put({ type: 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET', payload: microDate });
        }
        break;
      case 'FINISHED':
        if (microDate.finishBy === microDate.requestFor) {
          yield put({ type: 'MICRO_DATE_OUTGOING_FINISH', payload: microDate });
        } else if (
          microDate.finishBy === microDate.requestBy &&
          microDate[`${microDate.requestBy}_firstAlert`] === false) {
          yield put({ type: 'MICRO_DATE_OUTGOING_FINISH', payload: microDate });
        }
        break;
      default:
        console.log('Request removed');
        break;
    }
  }
}

function* outgoingMicroDateRequestInitSaga() {
  while (true) {
    const myUid = yield select((state) => state.auth.uid);
    const action = yield take('MICRO_DATE_OUTGOING_REQUEST_INIT');
    const { targetUser } = action.payload;
    const microDateRef = yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION).doc();
    const microDate = {
      status: 'REQUEST',
      requestBy: myUid,
      requestFor: targetUser.id,
      requestByRef: firebase.firestore().collection('geoPoints').doc(myUid),
      requestForRef: firebase.firestore().collection('geoPoints').doc(targetUser.id),
      requestTS: firebase.firestore.FieldValue.serverTimestamp(),
      active: true,
      id: microDateRef.id,
    };

    yield microDateRef.set(microDate);
  }
}

function* outgoingMicroDateAcceptSaga() {
  const action = yield take('MICRO_DATE_OUTGOING_ACCEPT');
  const microDate = action.payload;
  const isMicroDateMode = yield select((state) => state.microDate.enabled);
  if (!isMicroDateMode) yield* startMicroDateSaga(microDate);
}

function* startMicroDateSaga(microDate) {
  const myCoords = yield select((state) => state.location.coords);
  const userSnap = yield microDate.requestForRef.get();
  const targetUser = {
    id: userSnap.id,
    shortId: userSnap.id.substring(0, 4),
    ...userSnap.data(),
  };

  yield put({
    type: 'MICRO_DATE_OUTGOING_STARTED',
    payload: {
      targetUser,
      myCoords,
      distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
      microDateId: microDate.id,
    },
  });
  yield put({ type: 'GEO_LOCATION_FORCE_UPDATE' });
  yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_START' });
}

function* outgoingMicroDateCancelSaga(microDate: MicroDate) {
  yield take('MICRO_DATE_OUTGOING_CANCEL');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'CANCEL_REQUEST',
      active: false,
      cancelRequestTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
  yield put({ type: 'MICRO_DATE_OUTGOING_CANCELLED', payload: microDate });
}

function* outgoingMicroDateStopByMeSaga(microDate: MicroDate) {
  yield take('MICRO_DATE_STOP');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'STOP',
      active: false,
      stopBy: microDate.requestBy,
      stopTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
  yield put({ type: 'MICRO_DATE_OUTGOING_STOPPED_BY_ME' });
}

function* outgoingMicroDateSelfieUploadedByMeSaga() {
  while (true) {
    const action = yield take('MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME');
    const microDate = action.payload;
    const isMicroDateMode = yield select((state) => state.microDate.enabled);
    if (!isMicroDateMode) yield* startMicroDateSaga(microDate);
  }
}

function* outgoingMicroDateSelfieUploadedByTargetSaga() {
  while (true) {
    const action = yield take('MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET');
    const microDate = action.payload;
    const isMicroDateMode = yield select((state) => state.microDate.enabled);
    if (!isMicroDateMode) yield* startMicroDateSaga(microDate);
  }
}

function* outgoingMicroDateSelfieDeclineByMeSaga(microDate: MicroDate) {
  while (true) {
    yield take('MICRO_DATE_DECLINE_SELFIE_BY_ME');
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        status: 'ACCEPT',
      });
  }
}

function* outgoingMicroDateSelfieAcceptByMeSaga(microDate: MicroDate) {
  yield take('MICRO_DATE_APPROVE_SELFIE');
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'FINISHED',
      active: false,
      finishTS: firebase.firestore.FieldValue.serverTimestamp(),
      finishBy: microDate.requestBy,
      moderationStatus: 'PENDING',
      [`${microDate.requestBy}_firstAlert`]: false,
      [`${microDate.requestFor}_firstAlert`]: false,
    });
  yield put({ type: 'MICRO_DATE_OUTGOING_APPROVED_SELFIE' });
}

function* outgoingMicroDateFinishedSaga() {
  const action = yield take('MICRO_DATE_OUTGOING_FINISH');
  const microDate = action.payload;

  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      [`${microDate.requestBy}_firstAlert`]: true,
    });
  yield Actions.navigate({
    key: 'MicroDateScreen',
    routeName: 'MicroDateScreen',
    params: { microDate },
  });
  yield put({ type: 'MICRO_DATE_OUTGOING_FINISHED' });
}

function createChannelToMicroDate(microDateId) {
  const query = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDateId);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (dataSnapshot) => {
      // do not process local updates triggered by local writes
      if (dataSnapshot.metadata.hasPendingWrites === true) {
        return;
      }

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

    const unsubscribe = query.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  }, buffers.sliding(1));
}

function createChannelForOutgoingMicroDateRequests(uid) {
  const microDateStartedByOthersQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where('requestBy', '==', uid)
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
  }, buffers.expanding(5));
}
