import { put, select, call, take, takeEvery, cancel } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';
import GeoUtils from '../utils/geo-utils';

import {
  USERS_AROUND_SEARCH_RADIUS_KM,
  USERS_AROUND_SHOW_LAST_SEEN_HOURS_AGO,
} from '../constants';

const ONE_HOUR = 1000 * 60 * 60;
const collectionPath = 'geoPoints';
const geoPointPath = 'geoPoint';

export default function* usersAroundSaga() {
  try {
    yield take('GEO_LOCATION_STARTED');

    while (true) {
      const userCoords = yield select((state) => state.location.coords);
      const { currentUser } = yield call(firebase.auth);
      const usersAroundChannel = yield call(createUsersAroundChannel, userCoords, currentUser);
      const task1 = yield takeEvery(usersAroundChannel, updateUsersAround);
      yield take('USERS_AROUND_RESTART');
      yield cancel(task1);
      yield usersAroundChannel.close();
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

function createUsersAroundChannel(userCoords, currentUser) {
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

  const query = firebase.firestore().collection(collectionPath)
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
