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
    yield takeEvery('MICRO_DATE_MY_MOVE', handleMyMoveSaga);
    yield takeEvery('MICRO_DATE_TARGET_MOVE', handleTargetMoveSaga);
  } catch (error) {
    yield put({ type: 'MICRO_DATE_USER_MOVEMENTS_ERROR', payload: error });
  }
}

function* handleMyMoveSaga(action) {
  try {
    // yield console.log('handleMyMoveSaga', action);
    const microDate = yield select((state) => state.microDate);
    const myUid = yield select((state) => state.auth.uid);
    const myUidDB = myUid.substring(0, 8);
    const newCoords = action.payload;
    const myPreviousCoords = yield select((state) => state.microDate.myPreviousCoords);

    yield* checkDistance(microDate, newCoords, microDate.targetCurrentCoords);

    if (myPreviousCoords) {
      const timeDelta = (newCoords.clientTS - myPreviousCoords.clientTS) / 1000; // in seconds
      const distanceMoved = GeoUtils.distance(myPreviousCoords, newCoords);
      const velocity = Math.floor(distanceMoved / timeDelta); // in seconds

      if (
        velocity < MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION && // discard too fast moves, probably a noise from location services
        newCoords.accuracy < MINIMUM_ACCURACY_PAST_LOCATION && // discard not accurate enough locations
        distanceMoved > MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION // discard too nearby updates
      ) {
        yield firebase.firestore()
          .collection(MICRO_DATES_COLLECTION)
          .doc(microDate.id)
          .collection(`pastLocations_${myUidDB}`)
          .add({
            distance: distanceMoved,
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

    let myScore = yield select((state) => state.microDate.myScore);
    const targetPreviousCoords = yield select((state) => state.microDate.targetPreviousCoords);

    if (targetPreviousCoords) {
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
  } catch (error) {
    yield put({ type: 'MICRO_DATE_USER_MOVEMENTS_HANDLE_MY_MOVE_ERROR', payload: error });
  }
}

function* handleTargetMoveSaga(action) {
  const myCoords = yield select((state) => state.location.coords);
  const targetCoords = action.payload.geoPoint;
  const microDate = yield select((state) => state.microDate);
  yield* checkDistance(microDate, myCoords, targetCoords);
}

function* checkDistance(microDate, myCoords, targetCoords) {
  if (!microDate.targetCurrentCoords) {
    return;
  }

  const distanceToTarget = GeoUtils.distance(myCoords, targetCoords);
  const mapPanelMode = yield select((state) => state.mapPanel.mode);

  if (distanceToTarget < DISTANCE_TO_UPLOAD_SELFIE_THRESHOLD) {
    if (mapPanelMode === 'makeSelfie') {
      return;
    }

    yield put({
      type: 'UI_MAP_PANEL_SHOW',
      payload: {
        mode: 'makeSelfie',
        canHide: true,
      },
    });
  } else if (mapPanelMode === 'makeSelfie') {
    yield put({
      type: 'UI_MAP_PANEL_SET_MODE',
      payload: {
        mode: 'activeMicroDate',
        canHide: true,
        distance: GeoUtils.distance(microDate.targetCurrentCoords, myCoords),
      },
    });
  }
}
