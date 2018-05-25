import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';
import GeoUtils from '../../utils/geo-utils';

import { MICRO_DATES_COLLECTION } from '../../constants';

export default function* microDateOutgoingRequestsSaga() {
  let microDateChannel;
  let microDateUpdatesTask;

  try {
    const myUid = yield select((state) => state.auth.uid);
    const activeMicroDate = yield getActiveOutgoingDate(myUid);

    if (activeMicroDate) {
      microDateChannel = yield call(createChannelToMicroDate, activeMicroDate.id);
      microDateUpdatesTask = yield takeEvery(microDateChannel, handleOutgoingRequestsSaga);

      const nextAction = yield take([
        'MICRO_DATE_OUTGOING_CANCEL',
        'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET',
        'MICRO_DATE_STOPPED_BY_TARGET',
        'MICRO_DATE_STOP',
      ]);

      if (nextAction.type === 'MICRO_DATE_OUTGOING_CANCEL') {
        yield* handleCancelRequest(microDateChannel, microDateUpdatesTask, activeMicroDate.id);
      } else if (nextAction.type === 'MICRO_DATE_STOP') {
        yield* handleStopRequest(microDateChannel, microDateUpdatesTask, activeMicroDate);
      } else {
        yield* cancelMicroDateTaskAndChannel(microDateChannel, microDateUpdatesTask);
      }
    }

    while (true) {
      const action = yield take('MICRO_DATE_OUTGOING_REQUEST');
      const targetUser = action.payload.user;
      const microDate = {
        status: 'REQUEST',
        requestBy: myUid,
        requestFor: targetUser.uid,
        requestByRef: firebase.firestore().collection('geoPoints').doc(myUid),
        requestForRef: firebase.firestore().collection('geoPoints').doc(targetUser.uid),
        requestTS: firebase.firestore.FieldValue.serverTimestamp(),
        active: true,
      };
      const microDateRef = yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .add(microDate);

      microDateChannel = yield call(createChannelToMicroDate, microDateRef.id);
      microDateUpdatesTask = yield takeEvery(microDateChannel, handleOutgoingRequestsSaga);

      const nextAction = yield take([
        'MICRO_DATE_OUTGOING_CANCEL',
        'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET',
        'MICRO_DATE_STOPPED_BY_TARGET',
        'MICRO_DATE_STOP',
      ]);

      if (nextAction.type === 'MICRO_DATE_OUTGOING_CANCEL') {
        yield* handleCancelRequest(microDateChannel, microDateUpdatesTask, microDateRef.id);
      } else if (nextAction.type === 'MICRO_DATE_STOP') {
        yield* handleStopRequest(microDateChannel, microDateUpdatesTask, { ...microDate, id: microDateRef.id });
      } else {
        yield* cancelMicroDateTaskAndChannel(microDateChannel, microDateUpdatesTask);
      }
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_OUTGOING_ERROR', payload: error });
  }

  function* handleOutgoingRequestsSaga(microDate) {
    if (microDate.error) {
      throw new Error(microDate.error);
    }

    const myCoords = yield select((state) => state.location.coords);
    const userSnap = yield microDate.requestForRef.get();
    const user = {
      id: userSnap.id,
      shortId: userSnap.id.substring(0, 4),
      ...userSnap.data(),
    };

    switch (microDate.status) {
      case 'REQUEST':
        yield put({
          type: 'UI_MAP_PANEL_SHOW',
          payload: {
            mode: 'outgoingMicroDateAwaitingAccept',
            canHide: false,
            microDate: {
              id: microDate.id,
              requestFor: microDate.requestFor,
              requestTS: microDate.requestTS,
            },
          },
        });

        yield put({ type: 'MICRO_DATE_OUTGOING_REQUESTED' });

        break;
      case 'DECLINE':
        yield put({
          type: 'UI_MAP_PANEL_SHOW',
          payload: {
            mode: 'outgoingMicroDateDeclined',
            canHide: true,
            microDate: {
              id: microDate.id,
              requestFor: microDate.requestFor,
              declineTS: microDate.declineTS,
            },
          },
        });

        yield put({ type: 'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET' });

        break;
      case 'ACCEPT':
        yield put({
          type: 'MICRO_DATE_OUTGOING_START',
          payload: {
            user,
            myCoords,
            distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
            microDateId: microDate.id,
          },
        });

        yield put({
          type: 'UI_MAP_PANEL_SHOW',
          payload: {
            mode: 'activeMicroDate',
            canHide: true,
            user,
            myCoords,
            distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
            microDateId: microDate.id,
          },
        });
        break;
      case 'STOP':
        if (microDate.stopBy !== microDate.requestBy) {
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
        break;
      default:
        console.log('Request removed');
        break;
    }
  }
}

function* handleCancelRequest(microDateChannel, microDateUpdatesTask, microDateId) {
  yield* cancelMicroDateTaskAndChannel(microDateChannel, microDateUpdatesTask);
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDateId)
    .update({
      status: 'CANCEL_REQUEST',
      active: false,
      cancelRequestTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
  yield put({ type: 'MICRO_DATE_OUTGOING_CANCELLED' });
}

function* handleStopRequest(microDateChannel, microDateUpdatesTask, microDate) {
  yield* cancelMicroDateTaskAndChannel(microDateChannel, microDateUpdatesTask);
  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDate.id)
    .update({
      status: 'STOP',
      active: false,
      stopBy: microDate.requestBy,
      stopTS: firebase.firestore.FieldValue.serverTimestamp(),
    });
  yield put({ type: 'MICRO_DATE_STOPPED' });
}

function* cancelMicroDateTaskAndChannel(microDateChannel, microDateUpdatesTask) {
  yield cancel(microDateUpdatesTask);
  yield microDateChannel.close();
}

function createChannelToMicroDate(microDateId) {
  const query = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDateId);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (dataSnapshot) => {
      // do not process local updates triggered by local writes
      if (dataSnapshot.metadata.hasPendingWrites) {
        return;
      }

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
  // console.log('Active dates by me: ', dateStartedByMeSnapshot.docs.length);
  const activeDateSnapshot = dateStartedByMeSnapshot.docs[0];

  return activeDateSnapshot ? {
    id: activeDateSnapshot.id,
    ...activeDateSnapshot.data(),
  } : null;
}
