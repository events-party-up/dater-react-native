import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import GeoUtils from '../utils/geo-utils';

export default function* findUserSaga() {
  try {
    while (true) {
      const action = yield take('FIND_USER_START');
      const userToFind = action.payload;
      const targetUserCoordsChannel = yield call(createChannelToTackCoordsForTarget, userToFind);
      const task1 = yield takeEvery(targetUserCoordsChannel, updateTargetUserCoords);
      yield put({ type: 'FIND_USER_STARTED' });
      const myCoords = yield select((state) => state.location.coords);
      yield put({
        type: 'UI_MAP_PANEL_REPLACE_START',
        payload: {
          mode: 'findUser',
          user: userToFind,
          distance: GeoUtils.distance(userToFind.geoPoint, myCoords),
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

function* updateTargetUserCoords(newCoords) {
  yield put({ type: 'FIND_USER_NEW_MOVE', payload: newCoords });
}

function createChannelToTackCoordsForTarget(user) {
  const query = firebase.firestore().collection('geoPoints').doc(user.uid);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (userSnapshot) => {
      const userData = userSnapshot.data();
      emit({
        latitude: userData.geoPoint.latitude,
        longitude: userData.geoPoint.longitude,
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
