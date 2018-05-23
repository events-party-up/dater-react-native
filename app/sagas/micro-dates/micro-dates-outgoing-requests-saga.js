import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';
import GeoUtils from '../../utils/geo-utils';

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
      const nextAction = yield take([
        'FIND_USER_CANCEL_REQUEST',
        'FIND_USER_DECLINED_BY_TARGET_REQUEST',
        'FIND_USER_STOPPED_BY_TARGET',
        'FIND_USER_STOP',
      ]);
      if (nextAction.type === 'FIND_USER_CANCEL_REQUEST') {
        yield* handleCancelRequest(microDateChannel, microDateUpdatesTask, activeMicroDate.id);
      } else if (nextAction.type === 'FIND_USER_STOP') {
        yield* handleStopRequest(microDateChannel, microDateUpdatesTask, activeMicroDate);
      } else {
        yield* cancelMicroDateTaskAndChannel(microDateChannel, microDateUpdatesTask);
      }
    }
    while (true) {
      const action = yield take('FIND_USER_REQUEST');
      const targetUser = action.payload.user;
      const microDate = {
        status: 'REQUEST',
        requestBy: myUid,
        requestFor: targetUser.uid,
        requestByRef: firebase.firestore().collection('geoPoints').doc(myUid),
        requestForRef: firebase.firestore().collection('geoPoints').doc(targetUser.uid),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        active: true,
      };
      const microDateRef = yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .add(microDate);
      microDateChannel = yield call(createChannelToMicroDate, microDateRef.id);
      microDateUpdatesTask = yield takeEvery(microDateChannel, handleOutgoingRequestsSaga);
      const nextAction = yield take([
        'FIND_USER_CANCEL_REQUEST',
        'FIND_USER_DECLINED_BY_TARGET_REQUEST',
        'FIND_USER_STOPPED_BY_TARGET',
        'FIND_USER_STOP',
      ]);
      yield console.log(microDate);
      if (nextAction.type === 'FIND_USER_CANCEL_REQUEST') {
        yield* handleCancelRequest(microDateChannel, microDateUpdatesTask, microDateRef.id);
      } else if (nextAction.type === 'FIND_USER_STOP') {
        yield* handleStopRequest(microDateChannel, microDateUpdatesTask, { ...microDate, id: microDateRef.id });
      } else {
        yield* cancelMicroDateTaskAndChannel(microDateChannel, microDateUpdatesTask);
      }
    }
  } catch (error) {
    yield put({ type: 'FIND_USER_ERROR', payload: error });
  }

  function* handleOutgoingRequestsSaga(microDate) {
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
      case 'DECLINE':
        yield put({
          type: 'UI_MAP_PANEL_SHOW',
          payload: {
            mode: 'newDateDeclined',
            canHide: true,
            microDate: {
              id: microDate.id,
              requestFor: microDate.requestFor,
              declineTS: microDate.declineTS,
            },
          },
        });

        yield put({
          type: 'FIND_USER_DECLINED_BY_TARGET_REQUEST',
        });

        break;
      case 'ACCEPT':
        yield put({
          type: 'FIND_USER_START',
          payload: {
            user,
            myCoords,
            startDistance: microDate.startDistance,
            distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
            microDateId: microDate.id,
          },
        });
        yield put({
          type: 'UI_MAP_PANEL_SHOW',
          payload: {
            mode: 'findUser',
            canHide: true,
            user,
            myCoords,
            startDistance: microDate.startDistance,
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
              mode: 'newDateStopped',
              canHide: true,
              microDate,
            },
          });
          yield put({ type: 'FIND_USER_STOPPED_BY_TARGET' });
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
  yield put({ type: 'FIND_USER_CANCELLED_REQUEST' });
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
  yield put({ type: 'FIND_USER_STOPPED' });
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
      emit({
        id: dataSnapshot.id,
        ...dataSnapshot.data(),
      });
    };
    const onError = (error) => {
      console.error(error);
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
