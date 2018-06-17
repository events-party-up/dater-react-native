import { put, takeEvery, select } from 'redux-saga/effects';
import firebase from 'react-native-firebase';

import GeoUtils from '../../utils/geo-utils';
import {
  MICRO_DATES_COLLECTION,
  MINIMUM_ACCURACY_PAST_LOCATION,
  MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION,
  DISTANCE_TO_UPLOAD_SELFIE_THRESHOLD,
} from '../../constants';

export default function* microDateUserMovementsSaga() {
  try {
    yield takeEvery('MICRO_DATE_TARGET_MOVE', microDateUserMovementsTargetMoveSaga);
    yield takeEvery([
      'MICRO_DATE_OUTGOING_STARTED',
      'MICRO_DATE_INCOMING_START',
    ], microDateWriteFirstPastLocationOnStartSaga);
  } catch (error) {
    yield put({ type: 'MICRO_DATE_USER_MOVEMENTS_ERROR', payload: error });
  }
}

function* microDateWriteFirstPastLocationOnStartSaga() {
  const myCoords = yield select((state) => state.location.coords);
  const microDateId = yield select((state) => state.microDate.id);
  const myUid = yield select((state) => state.auth.uid);
  const myUidDB = myUid.substring(0, 8);

  yield firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .doc(microDateId)
    .collection(`${myUidDB}_pastLocations`)
    .add({
      geoPoint: new firebase.firestore.GeoPoint(myCoords.latitude, myCoords.longitude),
      serverTS: firebase.firestore.FieldValue.serverTimestamp(),
      clientTS: new Date(),
    });
}

export function* microDateUserMovementsMyMoveSaga(newCoords) {
  try {
    const microDate = yield select((state) => state.microDate);
    const isMicroDateEnabled = yield select((state) => state.microDate.enabled);

    if (!isMicroDateEnabled) return;

    yield put({
      type: 'MICRO_DATE_MY_MOVE',
      payload: {
        latitude: newCoords.latitude,
        longitude: newCoords.longitude,
        accuracy: newCoords.accuracy,
        clientTS: new Date(),
      },
    });

    const myUid = yield select((state) => state.auth.uid);
    const myUidDB = myUid.substring(0, 8);
    const myPreviousCoords = yield select((state) => state.microDate.myPreviousCoords);

    if (myPreviousCoords) {
      const timeDelta = (new Date() - myPreviousCoords.clientTS) / 1000; // in seconds
      const distanceDelta = GeoUtils.distance(myPreviousCoords, newCoords);
      const velocity = Math.floor(distanceDelta / timeDelta); // in seconds

      if (velocity > MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION ||
        newCoords.accuracy > MINIMUM_ACCURACY_PAST_LOCATION ||
        distanceDelta < MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
        return;
      }

      yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .doc(microDate.id)
        .collection(`${myUidDB}_pastLocations`)
        .add({
          distanceDelta,
          velocity,
          geoPoint: new firebase.firestore.GeoPoint(newCoords.latitude, newCoords.longitude),
          serverTS: firebase.firestore.FieldValue.serverTimestamp(),
          clientTS: new Date(),
          heading: GeoUtils.getBearing(myPreviousCoords, newCoords),
        });
    }

    let myScore = yield select((state) => state.microDate.myScore);
    const targetPreviousCoords = yield select((state) => state.microDate.targetPreviousCoords);

    if (targetPreviousCoords && myPreviousCoords) {
      const currentDistanceFromOpponent = GeoUtils.distance(newCoords, targetPreviousCoords);
      const pastDistanceFromOpponent = GeoUtils.distance(myPreviousCoords, targetPreviousCoords);
      const opponentDistanceDelta = pastDistanceFromOpponent - currentDistanceFromOpponent;

      myScore += opponentDistanceDelta;

      yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .doc(microDate.id)
        .collection('stats')
        .doc(myUidDB)
        .set({
          score: myScore,
        }, { merge: true });
    }

    yield put({
      type: 'MICRO_DATE_MY_MOVE_RECORDED',
      payload: {
        newCoords,
        myScore,
      },
    });

    yield* checkDistance(microDate, newCoords, microDate.targetCurrentCoords);
  } catch (error) {
    yield put({ type: 'MICRO_DATE_USER_MOVEMENTS_HANDLE_MY_MOVE_ERROR', payload: error });
  }
}

function* microDateUserMovementsTargetMoveSaga(action) {
  const myCoords = yield select((state) => state.location.coords);
  const targetCoords = action.payload.geoPoint;
  const microDate = yield select((state) => state.microDate);
  yield* checkDistance(microDate, myCoords, targetCoords);
}

function* checkDistance(microDate, myCoords, targetCoords) {
  const appState = yield select((state) => state.appState.state);
  const photoMode = yield select((state) => state.microDate.photoMode);

  if (!microDate.targetCurrentCoords ||
    appState !== 'active' ||
    photoMode) {
    return;
  }

  const distanceToTarget = GeoUtils.distance(myCoords, targetCoords);

  if (distanceToTarget < DISTANCE_TO_UPLOAD_SELFIE_THRESHOLD) {
    yield put({
      type: 'MICRO_DATE_CLOSE_DISTANCE_MOVE',
      payload: {
        distanceToTarget,
      },
    });
  }
}
