import { put, select, call, take, takeEvery } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';
import GeoUtils from '../utils/geo-utils';

const ONE_HOUR = 1000 * 60 * 60;
const SHOW_USERS_LAST_SEEN_HOURS_AGO = 12;
const DEFAULT_SEARCH_RADIUS_KM = 25;
const collectionPath = 'geoPoints';
const geoPointPath = 'geoPoint';

export default function* usersAroundSaga() {
  try {
    yield take('GEO_LOCATION_UPDATED');
    const userCoords = yield select((state) => state.location.coords);
    const { currentUser } = yield call(firebase.auth);
    const usersAroundChannel = yield call(createUsersAroundChannel, userCoords, currentUser);
    yield takeEvery(usersAroundChannel, updateUsersAround);
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
    radius: DEFAULT_SEARCH_RADIUS_KM,
  };
  const box = GeoUtils.boundingBoxCoordinates(queryArea.center, queryArea.radius);
  const lesserGeopoint = new firebase.firestore
    .GeoPoint(box.swCorner.latitude, box.swCorner.longitude);
  const greaterGeopoint = new firebase.firestore
    .GeoPoint(box.neCorner.latitude, box.neCorner.longitude);
  // construct the Firestore query
  const query = firebase.firestore().collection(collectionPath)
    .where(geoPointPath, '>', lesserGeopoint)
    .where(geoPointPath, '<', greaterGeopoint)
    .where('visible', '==', true);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (snapshot) => {
      const usersAround = []; // used to hold all the loc data
      snapshot.forEach((userSnapshot) => {
        const userData = userSnapshot.data();
        userData.uid = userSnapshot.id;

        if (currentUser && userData.uid === currentUser.uid) {
          return;
        } else if (Date.now() - new Date(userData.timestamp) > ONE_HOUR * SHOW_USERS_LAST_SEEN_HOURS_AGO) {
          // only show users with fresh timestamps
          return;
        }

        userData.shortId = userSnapshot.id.substring(0, 4);
        userData.distance = GeoUtils.distance(queryArea.center, userData[geoPointPath]);
        usersAround.push(userData);
      });
      emit(usersAround);

      // snapshot.docChanges.forEach(function (change) {
      //   if (change.type === "added") {
      //     console.log("New locaiton: ", change.doc.data());
      //   }
      //   if (change.type === "modified") {
      //     console.log("Modified locaiton: ", change.doc.data());
      //   }
      //   if (change.type === "removed") {
      //     console.log("Removed location: ", change.doc.data());
      //   }
      // });
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
