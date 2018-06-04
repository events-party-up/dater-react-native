import { put, select, call, take, takeEvery, cancel } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';
import GeoUtils from '../utils/geo-utils';

import {
  USERS_AROUND_SEARCH_RADIUS_KM,
  USERS_AROUND_SHOW_LAST_SEEN_HOURS_AGO,
  GEO_POINTS_COLLECTION,
} from '../constants';

const ONE_HOUR = 1000 * 60 * 60;
const geoPointPath = 'geoPoint';

export default function* usersAroundSaga() {
  try {
    yield take('GEO_LOCATION_STARTED');
    let isManuallyStopped = false;
    let isMicroDateMode = false;
    let channel;
    let channelTask;

    while (true) {
      // only start when app state is active
      const appState = yield select((state) => state.appState.state);
      if (appState !== 'active') {
        yield take('APP_STATE_ACTIVE');
      }

      if (isManuallyStopped) {
        yield take('USERS_AROUND_START');
        isManuallyStopped = false;
      }

      let myCoords = yield select((state) => state.location.coords);

      // if there are no location coords, wait for the first coords
      if (!myCoords) {
        const newLocationAction = yield take('GEO_LOCATION_UPDATED');
        myCoords = newLocationAction.payload;
      }

      const { currentUser } = yield call(firebase.auth);
      if (isMicroDateMode) {
        const microDateState = yield select((state) => state.microDate);
        channel = yield call(createMicroDateChannel, myCoords, currentUser, microDateState);
        channelTask = yield takeEvery(channel, updateMicroDate);
      } else {
        channel = yield call(createAllUsersAroundChannel, myCoords, currentUser);
        channelTask = yield takeEvery(channel, updateUsersAround);
      }

      yield put({ type: 'USERS_AROUND_STARTED' });

      const stopAction = yield take([
        'USERS_AROUND_RESTART',
        'APP_STATE_BACKGROUND', // stop if app is in background
        'GEO_LOCATION_STOPPED', // stop if location services are disabled
        'USERS_AROUND_STOP',
        'MICRO_DATE_INCOMING_START', // app mode switched to find user
        'MICRO_DATE_OUTGOING_START', // app mode switched to find user
        'MICRO_DATE_STOP',
        'MICRO_DATE_STOPPED_BY_TARGET',
        'MICRO_DATE_OUTGOING_FINISHED',
        'MICRO_DATE_INCOMING_FINISHED',
        'MICRO_DATE_INCOMING_REMOVE',
        'MICRO_DATE_OUTGOING_REMOVE',
      ]);

      if (stopAction.type === 'USERS_AROUND_STOP') {
        isManuallyStopped = true;
      }

      if (stopAction.type === 'MICRO_DATE_INCOMING_START' ||
          stopAction.type === 'MICRO_DATE_OUTGOING_START') {
        isMicroDateMode = true;
      }

      if (stopAction.type === 'MICRO_DATE_STOP' ||
        stopAction.type === 'MICRO_DATE_STOPPED_BY_TARGET' ||
        stopAction.type === 'MICRO_DATE_OUTGOING_FINISHED' ||
        stopAction.type === 'MICRO_DATE_INCOMING_FINISHED' ||
        stopAction.type === 'MICRO_DATE_INCOMING_REMOVE' ||
        stopAction.type === 'MICRO_DATE_OUTGOING_REMOVE'
      ) {
        isMicroDateMode = false;
      }

      yield cancel(channelTask);
      yield channel.close();
      yield put({ type: 'USERS_AROUND_STOPPED' });
    }
  } catch (error) {
    yield put({ type: 'USERS_AROUND_SAGA_ERROR', payload: error });
  }
}

function* updateUsersAround(usersAround) {
  if (usersAround.error) {
    yield put({
      type: 'USERS_AROUND_CHANNEL_ERROR',
      payload: usersAround.error,
    });
  } else {
    yield put({
      type: 'USERS_AROUND_UPDATED',
      payload: usersAround,
    });
  }
}

function* updateMicroDate(targetUser) {
  if (targetUser.error) {
    yield put({
      type: 'USERS_AROUND_MICRO_DATE_CHANNEL_ERROR',
      payload: targetUser.error,
    });
  } else {
    yield put({
      type: 'USERS_AROUND_MICRO_DATE_UPDATED',
      payload: [targetUser],
    });
    yield put({
      type: 'MICRO_DATE_TARGET_MOVE',
      payload: targetUser,
    });
  }
}

function createAllUsersAroundChannel(userCoords, currentUser) {
  const queryArea = {
    center: {
      latitude: userCoords.latitude,
      longitude: userCoords.longitude,
    },
    radius: USERS_AROUND_SEARCH_RADIUS_KM,
  };
  const box = GeoUtils.boundingBoxCoordinates(queryArea.center, queryArea.radius);
  const lesserGeopoint = new firebase.firestore
    .GeoPoint(box.swCorner.latitude, box.swCorner.longitude);
  const greaterGeopoint = new firebase.firestore
    .GeoPoint(box.neCorner.latitude, box.neCorner.longitude);

  const query = firebase.firestore().collection(GEO_POINTS_COLLECTION)
    .where(geoPointPath, '>', lesserGeopoint)
    .where(geoPointPath, '<', greaterGeopoint)
    .where('visible', '==', true);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) { // do not process local updates triggered by local writes
        return;
      }

      const usersAround = [];
      snapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.data();
        userData.id = userSnapshot.id;

        if (currentUser && userData.id === currentUser.uid) {
          return;
        } else if (Date.now() - new Date(userData.timestamp) > ONE_HOUR * USERS_AROUND_SHOW_LAST_SEEN_HOURS_AGO) {
          // only show users with fresh timestamps
          return;
        }

        userData.shortId = userSnapshot.id.substring(0, 4);
        userData.distance = GeoUtils.distance(queryArea.center, userData[geoPointPath]);
        usersAround.push(userData);
      });
      emit(usersAround);

    //   snapshot.docChanges.forEach((change) => {
    //     if (change.type === 'added') {
    //       console.log('New locaiton: ', change.doc.data());
    //     }
    //     if (change.type === 'modified') {
    //       console.log('Modified locaiton: ', change.doc.data());
    //     }
    //     if (change.type === 'removed') {
    //       console.log('Removed location: ', change.doc.data());
    //     }
    //     if (change.type) {
    //       console.log('User ID: ', change.doc.id);
    //     }
    //   });
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


function createMicroDateChannel(myCoords, currentUser, microDateState) {
  const query = firebase.firestore().collection(GEO_POINTS_COLLECTION).doc(microDateState.targetUserUid);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) { // do not process local updates triggered by local writes
        return;
      }

      const targetUser = snapshot.data();
      if (!targetUser) return;

      targetUser.id = snapshot.id;
      targetUser.shortId = snapshot.id.substring(0, 4);
      targetUser.distance = GeoUtils.distance(myCoords, targetUser[geoPointPath]);

      emit(targetUser);
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

