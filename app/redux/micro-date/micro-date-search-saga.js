import { take, put, takeEvery, select, cancel, race, fork, delay } from 'redux-saga/effects';
import { eventChannel, buffers } from 'redux-saga';
import firebase from 'react-native-firebase';

import {
  GEO_POINTS_COLLECTION,
  MAP_MAX_ZOOM_LEVEL,
  MICRO_DATES_COLLECTION,
} from '../../constants';

export default function* microDateSearchSaga() {
  try {
    const myUid = yield select((state) => state.auth.uid);

    yield takeEvery('MICRO_DATE_IM_READY', startSearch, myUid);
    yield fork(cancelPendingSearchActions, myUid);

    if (yield hasActiveMicroDate(myUid)) return;

    if (yield hasPendingSearch(myUid)) {
      yield put({ type: 'MICRO_DATE_IM_READY' });
    } else {
      yield put({ type: 'MICRO_DATE_ASK_ARE_YOU_READY' });
    }
  } catch (error) {
    yield put({ type: 'MICRO_DATE_SEARCH_ERROR', payload: error });
  }
}

async function hasActiveMicroDate(myUid) {
  const microDateQuery = firebase.firestore()
    .collection(MICRO_DATES_COLLECTION)
    .where(`players.${myUid}`, '==', true)
    .where('active', '==', true)
    .limit(1);

  const microDatesSnapshot = await microDateQuery.get();
  return microDatesSnapshot.docs.length > 0;
}

async function hasPendingSearch(myUid) {
  const myGeoPointRef = firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(myUid);

  const myGeoPointRefSnap = await myGeoPointRef.get();
  const myGeoPoint = myGeoPointRefSnap.data();
  return myGeoPoint.readyToDate && myGeoPoint.readyToDate === true;
}

function* startSearch(myUid) {
  yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME' });

  yield firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(myUid)
    .update({
      readyToDateStatus: 'PENDING',
      readyToDate: true,
      readyToDateTS: firebase.firestore.FieldValue.serverTimestamp(),
    });

  const geoUpdateTask = yield fork(repeatedForceGeoUpdate);
  const mapViewZoomTask = yield fork(loopedMapViewZoom);
  const readyToDateExpiredChan = yield readyToDateRequestExpiredChannel(myUid);

  const { expired } = yield race({
    expired: take(readyToDateExpiredChan),
    other: take([
      'MICRO_DATE_START',
      'MICRO_DATE_PENDING_SEARCH_CANCEL',
    ]),
  });

  if (expired) {
    yield put({ type: 'MICRO_DATE_IM_READY_EXPIRED' });
  }

  yield cancel(geoUpdateTask, mapViewZoomTask);
  yield readyToDateExpiredChan.close();
}

function* repeatedForceGeoUpdate() {
  const timesToRepeat = 5;
  const repeatInterval = 10000;

  for (let i = 0; i < timesToRepeat; i += 1) {
    yield put({ type: 'GEO_LOCATION_FORCE_UPDATE' });
    yield delay(repeatInterval);
  }
}

function* loopedMapViewZoom() {
  let zoomOut = true;
  const zoomIncrement = 0.1;
  const zoomInterval = 1000;
  const maxZoomOut = 13;

  while (true) {
    const currentZoom = yield select((state) => state.mapView.zoom);
    let newZoom;

    if (zoomOut) {
      newZoom = currentZoom - zoomIncrement;
    } else {
      newZoom = currentZoom + zoomIncrement;
    }

    yield put({
      type: 'MAPVIEW_ZOOM_TO',
      payload: {
        zoom: newZoom,
        duration: 2000,
      },
    });
    yield delay(zoomInterval);

    if (currentZoom <= maxZoomOut) {
      zoomOut = false;
    }

    if (currentZoom >= MAP_MAX_ZOOM_LEVEL) {
      zoomOut = true;
    }
  }
}

function* cancelPendingSearchActions(myUid) {
  while (true) {
    const cancelTask = yield take([
      'MICRO_DATE_PENDING_SEARCH_CANCEL',
      'MICRO_DATE_STOPPED_BY_ME',
      'MICRO_DATE_REMOVE',
      'MICRO_DATE_FINISH',
      'MICRO_DATE_STOPPED_BY_TARGET',
    ]);
    yield firebase.firestore()
      .collection(GEO_POINTS_COLLECTION)
      .doc(myUid)
      .update({
        readyToDate: false,
      });
    if (cancelTask.type !== 'MICRO_DATE_STOPPED_BY_TARGET') {
      yield put({ type: 'MICRO_DATE_ASK_ARE_YOU_READY' });
    }
  }
}

function readyToDateRequestExpiredChannel(myUid) {
  const myGeoPointRef = firebase.firestore()
    .collection(GEO_POINTS_COLLECTION)
    .doc(myUid);

  return eventChannel((emit) => {
    const onSnapshotUpdated = (dataSnapshot) => {
      if (dataSnapshot.data().readyToDateStatus === 'EXPIRED') emit(true);
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    const unsubscribe = myGeoPointRef.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  }, buffers.sliding(1));
}
