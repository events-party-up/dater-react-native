import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import { MICRO_DATES_COLLECTION } from '../../constants';

export default function* microDatesOutgoingRequestsSaga() {
  let microDateChannel;
  let microDateUpdatesTask;

  try {
    const myUid = yield select((state) => state.auth.uid);
    const activeMicroDate = yield getActiveOutgoingDate(myUid);
    console.log('Has active outgoing date: ', activeMicroDate);

    if (activeMicroDate) {
      microDateChannel = yield call(createChannelToMicroDate, activeMicroDate.id);
      microDateUpdatesTask = yield takeEvery(microDateChannel, handleOutgoingRequestsSaga);
      yield take('FIND_USER_CANCEL_REQUEST');
      yield* handleCancelRequest(microDateChannel, microDateUpdatesTask, activeMicroDate.id);
    }
    while (true) {
      const action = yield take('FIND_USER_REQUEST');
      const targetUser = action.payload.user;

      const microDate = yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .add({
          status: 'REQUEST',
          requestBy: myUid,
          requestFor: targetUser.uid,
          requestByRef: firebase.firestore().collection('geoPoints').doc(myUid),
          requestForRef: firebase.firestore().collection('geoPoints').doc(targetUser.uid),
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          active: true,
        });

      microDateChannel = yield call(createChannelToMicroDate, microDate.id);
      microDateUpdatesTask = yield takeEvery(microDateChannel, handleOutgoingRequestsSaga);
      yield take('FIND_USER_CANCEL_REQUEST');
      yield* handleCancelRequest(microDateChannel, microDateUpdatesTask, microDate.id);
    }
  } catch (error) {
    yield put({ type: 'FIND_USER_ERROR', payload: error });
  }

  function* handleOutgoingRequestsSaga(microDate) {
    switch (microDate.status) {
      case 'REQUEST':
        yield put({
          type: 'UI_MAP_PANEL_SHOW',
          payload: {
            mode: 'newDateAwaitingAccept',
            canHide: false,
            microDate: {
              id: microDate.id,
              requestFor: microDate.requestFor,
              timestamp: Date.now(),
            },
          },
        });

        yield put({
          type: 'UI_MAP_PANEL_SHOW',
          payload: {
            mode: 'newDateAwaitingAccept',
            canHide: false,
            microDate: {
              id: microDate.id,
              requestFor: microDate.requestFor,
              timestamp: microDate.timestamp,
            },
          },
        });
        break;
      default:
        break;
    }
  }
}

function* handleCancelRequest(microDateChannel, microDateUpdatesTask, microDateId) {
  yield cancel(microDateUpdatesTask);
  yield microDateChannel.close();
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDateId)
    .update({
      status: 'CANCEL_REQUEST',
      active: false,
    });
  yield put({ type: 'FIND_USER_CANCELLED_REQUEST' });
}

function createChannelToMicroDate(microDateId) {
  const query = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDateId);
  return eventChannel((emit) => {
    const onSnapshotUpdated = (dataSnapshot) => {
      emit({
        id: dataSnapshot.id,
        ...dataSnapshot.data(),
      });
    };
    const onError = (error) => {
      emit({
        error,
      });
    };

    const unsubscribe = query.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  });
}

async function getActiveOutgoingDate(uid) {
  const dateStartedByMeQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where('requestBy', '==', uid)
    .where('active', '==', true);
  const dateStartedByMeSnapshot = await dateStartedByMeQuery.get();
  console.log('Active dates by me: ', dateStartedByMeSnapshot.docs.length);
  const activeDateSnapshot = dateStartedByMeSnapshot.docs[0];
  return activeDateSnapshot ? {
    id: activeDateSnapshot.id,
    ...activeDateSnapshot.data(),
  } : null;
}
