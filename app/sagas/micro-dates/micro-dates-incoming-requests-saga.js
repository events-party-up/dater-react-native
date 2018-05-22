import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import GeoUtils from '../../utils/geo-utils';
import { MICRO_DATES_COLLECTION } from '../../constants';

export default function* microDatesIncomingRequestsSaga() {
  try {
    const myUid = yield select((state) => state.auth.uid);
    const activeIncomingDates = yield hasActiveIncomingDates(myUid);
    console.log('Active incoming dates: ', activeIncomingDates);
    const incomingDateRequestsChannel = yield call(createChannelToMonitorIncomingDateRequests, myUid);
    let microDateUpdatesTask;
    let microDateChannel;

    while (true) { // possible realisation!
      const nextMicroDate = yield take(incomingDateRequestsChannel);
      if (microDateUpdatesTask && microDateChannel) {
        yield cancel(microDateUpdatesTask);
        yield microDateChannel.close();
      }
      microDateChannel = yield call(createChannelToMicroDate, nextMicroDate.id);
      microDateUpdatesTask = yield takeEvery(microDateChannel, handleIncomingMicroDate, microDateChannel);
    }
  } catch (error) {
    yield put({ type: 'FIND_USER_ERROR', payload: error });
  }
}

function* handleIncomingMicroDate(microDateChannel, microDate) {
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
    yield put({ type: 'FIND_USER_INCOMING_REQUEST', payload: microDate });
    yield put({
      type: 'UI_MAP_PANEL_SHOW',
      payload: {
        mode: 'newDateRequest',
        user,
        distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
        canHide: false,
        microDateId: microDate.id,
      },
    });
    const nextAction = yield take([
      'FIND_USER_DECLINE_REQUEST',
      'FIND_USER_ACCEPT_REQUEST',
    ]);

    if (nextAction.type === 'FIND_USER_DECLINE_REQUEST') {
      yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .doc(microDate.id)
        .update({
          status: 'DECLINE',
          declineTS: firebase.firestore.FieldValue.serverTimestamp(),
          active: false,
        });
      // cancel channel & task here
    } else if (nextAction.type === 'FIND_USER_ACCEPT_REQUEST') {
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
    yield take('FIND_USER_STOP');
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        status: 'STOP',
        active: false,
        stopTS: firebase.firestore.FieldValue.serverTimestamp(),
      });
    yield put({ type: 'FIND_USER_STOPPED' });
    // cancel channel & task here
  } else if (microDate.status === 'CANCEL_REQUEST') {
    // cancel channel & task here
    yield put({
      type: 'UI_MAP_PANEL_SHOW',
      payload: {
        mode: 'newDateCancelled',
        canHide: true,
        microDate,
      },
    });
    // yield microDateChannel.close();
  }
}

function createChannelToMonitorIncomingDateRequests(uid) {
  const dateStartedByOthersQuery = firebase.firestore().collection(MICRO_DATES_COLLECTION)
    .where('requestFor', '==', uid)
    .where('active', '==', true)
    .orderBy('timestamp')
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
      console.error(error);
      emit({
        error,
      });
    };

    const unsubscribe = dateStartedByOthersQuery.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  });
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

async function hasActiveIncomingDates(uid) {
  const dateStartedByOthersQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where('requestFor', '==', uid)
    .where('active', '==', true);
  const dateStartedByOthersSnapshot = await dateStartedByOthersQuery.get();
  return dateStartedByOthersSnapshot.docs.length;
}
