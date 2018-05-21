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
    let isFindUserMode = false;
    let usersAroundChannel;

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
      if (isFindUserMode) {
        const findUserState = yield select((state) => state.findUser);
        usersAroundChannel = yield call(createFindUserChannel, myCoords, currentUser, findUserState);
      } else {
        usersAroundChannel = yield call(createAllUsersAroundChannel, myCoords, currentUser);
      }
      const task1 = yield takeEvery(usersAroundChannel, updateUsersAround);

      yield put({ type: 'USERS_AROUND_STARTED' });

      const stopAction = yield take([
        'USERS_AROUND_RESTART',
        'APP_STATE_BACKGROUND', // stop if app is in background
        'GEO_LOCATION_STOPPED', // stop if location services are disabled
        'USERS_AROUND_STOP',
        'FIND_USER_START', // app mode switched to find user
        'FIND_USER_STOP',
      ]);

      if (stopAction.type === 'USERS_AROUND_STOP') {
        isManuallyStopped = true;
      }

      if (stopAction.type === 'FIND_USER_START') {
        isFindUserMode = true;
      }

      if (stopAction.type === 'FIND_USER_STOP') {
        isFindUserMode = false;
      }

      yield cancel(task1);
      yield usersAroundChannel.close();
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
        userData.uid = userSnapshot.id;

        if (currentUser && userData.uid === currentUser.uid) {
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


function createFindUserChannel(myCoords, currentUser, findUserState) {
  const query = firebase.firestore().collection(GEO_POINTS_COLLECTION).doc(findUserState.targetUserUid);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (snapshot) => {
      if (snapshot.metadata.hasPendingWrites) { // do not process local updates triggered by local writes
        return;
      }

      const targetUser = snapshot.data();
      targetUser.uid = snapshot.id;
      targetUser.shortId = snapshot.id.substring(0, 4);
      targetUser.distance = GeoUtils.distance(myCoords, targetUser[geoPointPath]);

      emit([targetUser]);
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

