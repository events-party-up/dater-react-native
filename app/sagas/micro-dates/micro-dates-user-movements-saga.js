import { put, takeEvery, select } from 'redux-saga/effects';
import firebase from 'react-native-firebase';

import GeoUtils from '../../utils/geo-utils';
import {
  MICRO_DATES_COLLECTION,
  MINIMUM_ACCURACY_PAST_LOCATION,
  MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION,
} from '../../constants';

export default function* microDatesUserMovementsSaga() {
  try {
    yield takeEvery('FIND_USER_MY_MOVE', handleMyMoveSaga);
    yield takeEvery('FIND_USER_TARGET_MOVE', handleTargetMoveSaga);
  } catch (error) {
    yield put({ type: 'FIND_USER_ERROR', payload: error });
  }
}

function* handleMyMoveSaga(action) {
  yield console.log('handleMyMoveSaga', action);
  const microDateId = yield select((state) => state.findUser.microDateId);
  const myUid = yield select((state) => state.auth.uid);
  const myUidDB = myUid.substring(0, 8);
  const newCoords = action.payload;
  const myPreviousCoords = yield select((state) => state.findUser.myPreviousCoords);

  if (!myPreviousCoords) {
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDateId)
      .collection(`pastLocations_${myUidDB}`)
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
      yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .doc(microDateId)
        .collection(`pastLocations_${myUidDB}`)
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
  let myScore = yield select((state) => state.findUser.myScore);
  const targetPreviousCoords = yield select((state) => state.findUser.targetPreviousCoords);

  if (targetPreviousCoords) {
    const currentDistanceFromOpponent = GeoUtils.distance(newCoords, targetPreviousCoords);
    const pastDistanceFromOpponent = GeoUtils.distance(myPreviousCoords, targetPreviousCoords);
    const opponentDistanceDelta = pastDistanceFromOpponent - currentDistanceFromOpponent;
    myScore += opponentDistanceDelta;
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDateId)
      .collection('stats')
      .doc(myUidDB)
      .set({
        score: myScore,
      }, { merge: true });
  }

  yield put({
    type: 'FIND_USER_MY_MOVE_RECORDED',
    payload: {
      newCoords,
      myScore,
    },
  });
}

function* handleTargetMoveSaga(action) {
  yield console.log('handleTargetMoveSaga', action);
}
