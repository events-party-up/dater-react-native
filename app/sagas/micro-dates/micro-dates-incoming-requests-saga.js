import { call, take, put, takeEvery, select } from 'redux-saga/effects';
import { eventChannel } from 'redux-saga';
import firebase from 'react-native-firebase';

import GeoUtils from '../../utils/geo-utils';
import { MICRO_DATES_COLLECTION } from '../../constants';

export default function* microDatesIncomingRequestsSaga() {
  try {
    const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);
    if (!isUserAuthenticated) { // user must be authorized
      yield take('AUTH_SUCCESS');
    }
    const isGeolocationEnabled = yield select((state) => state.location.enabled);
    if (!isGeolocationEnabled) {
      yield take('GEO_LOCATION_STARTED'); // geo location must be enabled
    }

    const myUid = yield select((state) => state.auth.uid);
    const hasActiveDates = yield hasActiveDate(myUid);
    console.log('hasActiveDates: ', hasActiveDates);
    const incomingDateRequestsChannel = yield call(createChannelToMonitorIncomingDateRequests, myUid);
    yield takeEvery(incomingDateRequestsChannel, handleIncomingDateRequestsSaga);
  } catch (error) {
    yield put({ type: 'FIND_USER_ERROR', payload: error });
  }
}

function* handleIncomingDateRequestsSaga(microDate) {
  const myCoords = yield select((state) => state.location.coords);
  const userSnap = yield microDate.requestByRef.get();
  const user = {
    id: userSnap.id,
    shortId: userSnap.id.substring(0, 4),
    ...userSnap.data(),
  };

  if (microDate.status === 'REQUEST') {
    yield put({ type: 'FIND_USER_INCOMING_REQUEST', payload: microDate });
    yield put({
      type: 'UI_MAP_PANEL_SHOW',
      payload: {
        mode: 'newDateRequest',
        user,
        distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
        canHide: false,
        microDateId: microDate.id,
      },
    });
    const nextAction = yield take([
      'FIND_USER_DECLINE_REQUEST',
      'FIND_USER_ACCEPT_REQUEST',
    ]);

    if (nextAction.type === 'FIND_USER_DECLINE_REQUEST') {
      yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .doc(microDate.id)
        .update({
          status: 'DECLINE',
          active: false,
        });
    } else if (nextAction.type === 'FIND_USER_ACCEPT_REQUEST') {
      yield firebase.firestore()
        .collection(MICRO_DATES_COLLECTION)
        .doc(microDate.id)
        .update({
          status: 'ACCEPT',
          startDistance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
        });
    }
  } else if (microDate.status === 'ACCEPT') {
    yield put({
      type: 'FIND_USER_START',
      payload: {
        user,
        myCoords,
        startDistance: microDate.startDistance,
        distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
        microDateId: microDate.id,
      },
    });
    yield take('FIND_USER_STOP');
    yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        status: 'STOP',
        active: false,
      });
    yield put({ type: 'FIND_USER_STOPPED' });
  }
}

function createChannelToMonitorIncomingDateRequests(uid) {
  const dateStartedByOthersQuery = firebase.firestore().collection(MICRO_DATES_COLLECTION)
    .where('requestFor', '==', uid)
    .where('active', '==', true);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (snapshot) => {
      if (snapshot.docs.length > 0) {
        const dateRequest = snapshot.docs[0].data();
        emit({
          ...dateRequest,
          id: snapshot.docs[0].id,
        });
      }
    };
    const onError = (error) => {
      emit({
        error,
      });
    };

    const unsubscribe = dateStartedByOthersQuery.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  });
}

async function hasActiveDate(uid) {
  const dateStartedByMeQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where('requestBy', '==', uid)
    .where('active', '==', true);
  const dateStartedByMeSnapshot = await dateStartedByMeQuery.get();
  const dateStartedByOthersQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where('requestFor', '==', uid)
    .where('active', '==', true);
  const dateStartedByOthersSnapshot = await dateStartedByOthersQuery.get();
  console.log('Active dates by me: ', dateStartedByMeSnapshot.docs.length);
  console.log('Active dates by others: ', dateStartedByOthersSnapshot.docs.length);
  return dateStartedByMeSnapshot.docs.length > 0 || dateStartedByOthersSnapshot.docs.length > 0;
}
