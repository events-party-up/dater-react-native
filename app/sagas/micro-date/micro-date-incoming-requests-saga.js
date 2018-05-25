import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import GeoUtils from '../../utils/geo-utils';
import { MICRO_DATES_COLLECTION } from '../../constants';

export default function* microDateIncomingRequestsSaga() {
  try {
    const myUid = yield select((state) => state.auth.uid);
    const incomingMicroDateRequestsChannel = yield call(createChannelForIncomingMicroDateRequests, myUid);
    let microDateUpdatesTask;
    let microDateChannel;

    while (true) {
      const nextMicroDate = yield take(incomingMicroDateRequestsChannel);

      if (nextMicroDate.error) {
        throw new Error(nextMicroDate.error);
      }

      if (microDateUpdatesTask && microDateChannel) {
        yield cancel(microDateUpdatesTask);
        yield microDateChannel.close();
      }

      microDateChannel = yield call(createChannelToMicroDate, nextMicroDate.id);
      microDateUpdatesTask = yield takeEvery(microDateChannel, handleIncomingMicroDate, microDateChannel);
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_INCOMING_ERROR', payload: error });
  }
}

function* handleIncomingMicroDate(microDateChannel, microDate) {
  try {
    if (microDate.error) {
      throw new Error(microDate.error);
    }
    // console.log('Status changed to: ', microDate.status);
    // console.log('microDateChannel: ', microDateChannel);
    const myCoords = yield select((state) => state.location.coords);
    const userSnap = yield microDate.requestByRef.get();
    const user = {
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
          user,
          distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
          canHide: false,
          microDateId: microDate.id,
        },
      });

      const nextAction = yield take([
        'MICRO_DATE_INCOMING_DECLINE_BY_ME',
        'MICRO_DATE_INCOMING_ACCEPT',
      ]);

      if (nextAction.type === 'MICRO_DATE_INCOMING_DECLINE_BY_ME') {
        yield firebase.firestore()
          .collection(MICRO_DATES_COLLECTION)
          .doc(microDate.id)
          .update({
            status: 'DECLINE',
            declineTS: firebase.firestore.FieldValue.serverTimestamp(),
            active: false,
          });
        yield put({ type: 'MICRO_DATE_INCOMING_DECLINED_BY_ME' });
        // cancel channel & task here
        yield microDateChannel.close();
      } else if (nextAction.type === 'MICRO_DATE_INCOMING_ACCEPT') {
        yield firebase.firestore()
          .collection(MICRO_DATES_COLLECTION)
          .doc(microDate.id)
          .update({
            status: 'ACCEPT',
            startDistance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
            acceptTS: firebase.firestore.FieldValue.serverTimestamp(),
          });
      }
    } else if (microDate.status === 'ACCEPT') {
      yield put({ type: 'MICRO_DATE_INCOMING_ACCEPTED' });
      yield put({
        type: 'MICRO_DATE_INCOMING_START',
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
          canClose: true,
          mode: 'activeMicroDate',
          user,
          myCoords,
          distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
          microDateId: microDate.id,
        },
      });

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
      // cancel channel & task here
      yield microDateChannel.close();
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
      // cancel channel & task here
      yield microDateChannel.close();
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
      // cancel channel & task here
      yield microDateChannel.close();
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
      if (snapshot.docs.length > 0) {
        const dateRequest = snapshot.docs[0].data();
        emit({
          ...dateRequest,
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

    const unsubscribe = microDateQuery.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  });
}
