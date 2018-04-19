import { call, take, put, takeEvery, select, cancel } from 'redux-saga/effects';
import { delay, eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import GeoUtils from '../utils/geo-utils';

export default function* findUserSaga() {
  try {
    while (true) {
      const action = yield take('MAPVIEW_FIND_USER_START');
      const routeToUser = action.payload;
      const targetUserCoordsChannel = yield call(trackTargetUserCoordsChannel, routeToUser);
      const task1 = yield takeEvery(targetUserCoordsChannel, updateTargetUserCoords);
      yield put({
        type: 'MAPVIEW_FIND_USER_STARTED',
        payload: {
          uid: routeToUser.uid,
        },
      });
      yield delay(250);
      const myCoords = yield select((state) => state.location.coords);
      yield put({
        type: 'UI_MAP_PANEL_REPLACE_START',
        payload: {
          mode: 'findUser',
          data: {
            routeToUser,
            distance: GeoUtils.distance(routeToUser.geoPoint, myCoords),
          },
        },
      });
      yield take('MAPVIEW_FIND_USER_STOP');
      yield cancel(task1);
      yield targetUserCoordsChannel.close();
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_FIND_USER_ERROR', payload: error });
  }
}

function* updateTargetUserCoords(newCoords) {
  // TODO: put some logic to store user coords here!
  yield put({ type: 'MAPVIEW_FIND_USER_NEW_COORDS', payload: newCoords });
}

function trackTargetUserCoordsChannel(user) {
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
