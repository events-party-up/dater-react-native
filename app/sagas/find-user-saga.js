import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import GeoUtils from '../utils/geo-utils';

export default function* findUserSaga() {
  try {
    while (true) {
      const action = yield take('FIND_USER_START');
      const myCoords = yield select((state) => state.location.coords);
      const targetUser = action.payload.user;
      const startDistance = GeoUtils.distance(targetUser.geoPoint, myCoords);
      const targetUserCoordsChannel = yield call(createChannelToTackCoordsForTarget, targetUser);
      const task1 = yield takeEvery(targetUserCoordsChannel, updateTargetUserCoords);
      yield put({
        type: 'FIND_USER_STARTED',
        payload: {
          startDistance,
        },
      });
      yield put({
        type: 'UI_MAP_PANEL_REPLACE_START',
        payload: {
          mode: 'findUser',
          user: targetUser,
          startDistance,
        },
      });
      yield take('FIND_USER_STOP');
      yield cancel(task1);
      yield targetUserCoordsChannel.close();
      yield put({ type: 'UI_MAP_PANEL_HIDE_START' });
      yield put({ type: 'FIND_USER_STOPPED' });
    }
  } catch (error) {
    yield put({ type: 'FIND_USER_ERROR', payload: error });
  }
}

function* updateTargetUserCoords(newTargetUserCoords) {
  try {
    const myCoords = yield select((state) => state.location.coords);
    const distanceFromMe = GeoUtils.distance(newTargetUserCoords, myCoords);
    yield put({ type: 'FIND_USER_TARGET_MOVE', payload: { ...newTargetUserCoords, distanceFromMe } });
  } catch (error) {
    yield put({ type: 'FIND_USER_TARGET_MOVE_ERROR', payload: error });
  }
}

function createChannelToTackCoordsForTarget(user) {
  const query = firebase.firestore().collection('geoPoints').doc(user.uid);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (userSnapshot) => {
      const userData = userSnapshot.data();
      emit({
        accuracy: userData.accuracy,
        latitude: userData.geoPoint.latitude,
        longitude: userData.geoPoint.longitude,
        timestamp: Date.now(),
      });
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
