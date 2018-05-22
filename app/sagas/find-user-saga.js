import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import GeoUtils from '../utils/geo-utils';
import {
  MICRO_DATES_COLLECTION,
  MINIMUM_ACCURACY_PAST_LOCATION,
  MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION,
} from '../constants';

export default function* findUserSaga() {
  try {
    const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);
    if (!isUserAuthenticated) { // user must be authorized
      yield take('AUTH_SUCCESS');
    }
    const isGeolocationEnabled = yield select((state) => state.location.enabled);
    if (!isGeolocationEnabled) {
      yield take('GEO_LOCATION_STARTED'); // geo location must be enabled
    }

    const myUid = yield select((state) => state.auth.uid);
    const hasActiveDates = yield hasActiveDate(myUid);
    console.log('hasActiveDates: ', hasActiveDates);
    const dateRequestsChannel = yield call(createChannelToMonitorDateRequests, myUid);
    yield takeEvery(dateRequestsChannel, handleDateRequestsSaga);
    yield takeEvery('FIND_USER_MY_MOVE', handleMyMoveSaga);

    while (true) {
      const action = yield take('FIND_USER_REQUEST');
      const targetUser = action.payload.user;

      const microDate = yield firebase.firestore().collection(MICRO_DATES_COLLECTION).add({
        status: 'REQUEST',
        requestBy: myUid,
        requestFor: targetUser.uid,
        requestByRef: firebase.firestore().collection('geoPoints').doc(myUid),
        requestForRef: firebase.firestore().collection('geoPoints').doc(targetUser.uid),
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        active: true,
      });

      const microDateChannel = yield call(createChannelToMicroDate, microDate.id);
      const task1 = yield takeEvery(microDateChannel, microDateUpdatedSaga);

      yield put({
        type: 'FIND_USER_REQUESTED',
        payload: {
          user: targetUser,
        },
      });
      yield take('FIND_USER_STOP');
      yield cancel(task1);
      yield microDateChannel.close();
      yield put({ type: 'FIND_USER_STOPPED' });
    }
  } catch (error) {
    yield put({ type: 'FIND_USER_ERROR', payload: error });
  }
}

function* microDateUpdatedSaga(microDateData) {
  yield put({
    type: 'FIND_USER_UPDATED',
    payload: microDateData,
  });
}

function createChannelToMicroDate(microDateId) {
  const query = firebase.firestore().collection(MICRO_DATES_COLLECTION).doc(microDateId);
  return eventChannel((emit) => {
    const onSnapshotUpdated = (dataSnapshot) => {
      emit(dataSnapshot.data());
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

function* handleDateRequestsSaga(microDate) {
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
      yield firebase.firestore().collection(MICRO_DATES_COLLECTION).doc(microDate.id).update({
        status: 'DECLINE',
        active: false,
      });
    } else if (nextAction.type === 'FIND_USER_ACCEPT_REQUEST') {
      yield firebase.firestore().collection(MICRO_DATES_COLLECTION).doc(microDate.id).update({
        status: 'ACCEPT',
        startDistance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
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
    yield firebase.firestore().collection(MICRO_DATES_COLLECTION).doc(microDate.id).update({
      status: 'STOP',
      active: false,
    });
    yield put({ type: 'FIND_USER_STOPPED' });
  }
}

function* handleMyMoveSaga(action) {
  yield console.log('handleMyMoveSaga', action);
  const microDateId = yield select((state) => state.findUser.microDateId);
  const myUid = yield select((state) => state.auth.uid);
  const newCoords = action.payload;
  const myPreviousCoords = yield select((state) => state.findUser.myPreviousCoords);

  if (!myPreviousCoords) {
    yield firebase.firestore().collection(MICRO_DATES_COLLECTION)
      .doc(microDateId)
      .collection(myUid)
      .add({
        geoPoint: new firebase.firestore.GeoPoint(newCoords.latitude, newCoords.longitude),
        serverTS: firebase.firestore.FieldValue.serverTimestamp(),
        clientTS: newCoords.clientTS,
      });
  }

  if (myPreviousCoords) {
    const timeDelta = (newCoords.clientTS - myPreviousCoords.clientTS) / 1000; // in seconds
    const distance = GeoUtils.distance(myPreviousCoords, newCoords);
    const velocity = Math.floor(distance / timeDelta); // in seconds
    if (
      velocity < MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION && // discard too fast moves, probably a noise from location services
      newCoords.accuracy < MINIMUM_ACCURACY_PAST_LOCATION && // discard not accurate enough locations
      distance > MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION // discard too nearby updates
    ) {
      yield firebase.firestore().collection(MICRO_DATES_COLLECTION)
        .doc(microDateId)
        .collection(myUid)
        .add({
          distance,
          velocity,
          geoPoint: new firebase.firestore.GeoPoint(newCoords.latitude, newCoords.longitude),
          serverTS: firebase.firestore.FieldValue.serverTimestamp(),
          clientTS: newCoords.clientTS,
          heading: GeoUtils.getBearing(myPreviousCoords, newCoords),
        });
    } else { // discarding
      return;
    }
  }

  yield put({
    type: 'FIND_USER_MY_MOVE_RECORDED',
    payload: {
      newCoords,
    },
  });
}

function createChannelToMonitorDateRequests(uid) {
  const dateStartedByOthersQuery = firebase.firestore().collection(MICRO_DATES_COLLECTION)
    .where('requestFor', '==', uid)
    .where('active', '==', true);

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

    const unsubscribe = dateStartedByOthersQuery.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  });
}

async function hasActiveDate(uid) {
  const dateStartedByMeQuery = firebase.firestore().collection(MICRO_DATES_COLLECTION)
    .where('requestBy', '==', uid)
    .where('active', '==', true);
  const dateStartedByMeSnapshot = await dateStartedByMeQuery.get();
  const dateStartedByOthersQuery = firebase.firestore().collection(MICRO_DATES_COLLECTION)
    .where('requestFor', '==', uid)
    .where('active', '==', true);
  const dateStartedByOthersSnapshot = await dateStartedByOthersQuery.get();
  console.log('Active dates by me: ', dateStartedByMeSnapshot.docs.length);
  console.log('Active dates by others: ', dateStartedByOthersSnapshot.docs.length);
  return dateStartedByMeSnapshot.docs.length > 0 || dateStartedByOthersSnapshot.docs.length > 0;
}
