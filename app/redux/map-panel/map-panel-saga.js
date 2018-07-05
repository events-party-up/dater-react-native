import { call, take, put, actionChannel, cancel, takeLatest, select, throttle, delay } from 'redux-saga/effects';
import { buffers } from 'redux-saga';

import GeoUtils from '../../utils/geo-utils';

const mapPanelReplaceDelay = 250;
let mapPanelIsShowing = false;
let mapPanelIsShown = false;

export default function* mapPanelSaga() {
  try {
    while (true) {
      const { mapPanelSnapper } = yield take('UI_MAP_PANEL_READY');
      const showActions = yield actionChannel([
        'USERS_AROUND_ITEM_PRESSED',
        'MICRO_DATE_OUTGOING_REQUEST',
        'MICRO_DATE_INCOMING_REQUEST',
        'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET',
        'MICRO_DATE_INCOMING_CANCELLED',
        'MICRO_DATE_INCOMING_STARTED',
        'MICRO_DATE_OUTGOING_STARTED',
        'MICRO_DATE_OUTGOING_ACCEPT',
        'MICRO_DATE_INCOMING_ACCEPT',
        'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET',
        'MICRO_DATE_INCOMING_STOPPED_BY_TARGET',
        'MICRO_DATE_OUTGOING_SELFIE_DECLINED_BY_ME',
        'MICRO_DATE_INCOMING_SELFIE_DECLINED_BY_ME',
        'MICRO_DATE_INCOMING_SELFIE_DECLINED_BY_TARGET',
        'MICRO_DATE_OUTGOING_SELFIE_DECLINED_BY_TARGET',
        'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME',
        'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME',
        'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET',
        'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET',
        'MICRO_DATE_DECLINE_SELFIE_BY_ME',
        'MICRO_DATE_UPLOAD_PHOTO_START',
      ], buffers.none());

      const hideActions = yield actionChannel([
        'MAPVIEW_PRESSED',
        'MICRO_DATE_OUTGOING_REQUEST_INIT',
        'USERS_AROUND_ITEM_DESELECTED',
      ], buffers.none());

      const forceHideActions = yield actionChannel([
        'MICRO_DATE_OUTGOING_CANCEL',
        'MICRO_DATE_INCOMING_DECLINE_BY_ME',
        'MICRO_DATE_STOP',
        'MICRO_DATE_APPROVE_SELFIE',
        'MICRO_DATE_INCOMING_ACCEPT_INIT',
        'MICRO_DATE_INCOMING_REMOVE',
        'MICRO_DATE_OUTGOING_REMOVE',
        'MICRO_DATE_INCOMING_FINISHED',
        'MICRO_DATE_OUTGOING_FINISHED',
        'MICRO_DATE_DECLINE_SELFIE_BY_ME',
        'MICRO_DATE_UPLOAD_PHOTO_START',
        'MICRO_DATE_APPROVE_SELFIE',
        'UI_MAP_PANEL_HIDE_WITH_BUTTON',
        'MICRO_DATE_OUTGOING_ACCEPT',
      ]);
      const throttledActionsTask =
        yield throttle(5000, 'MICRO_DATE_CLOSE_DISTANCE_MOVE', mapPanelShowActionsSaga, mapPanelSnapper);
      const task1 = yield takeLatest(showActions, mapPanelShowActionsSaga, mapPanelSnapper);
      const task2 = yield takeLatest(hideActions, mapPanelHideActionsSaga, mapPanelSnapper);
      const task3 = yield takeLatest(forceHideActions, mapPanelForceHideActionsSaga, mapPanelSnapper);
      const task4 = yield takeLatest('UI_MAP_PANEL_HIDE_SNAPPED', showAgainIfCantHide, mapPanelSnapper);
      const task5 = yield takeLatest([
        'UI_MAP_PANEL_SHOW_SNAPPED',
        'UI_MAP_PANEL_SHOW_HALF_SCREEN_SNAPPED',
      ], markMapPanelShown);
      yield take('UI_MAP_PANEL_UNLOAD');
      yield cancel(throttledActionsTask, task1, task2, task3, task4, task5);
    }
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }
}

function* mapPanelShowActionsSaga(mapPanelSnapper, nextAction) {
  try {
    const setModePayload = yield getMapPanelPayload(nextAction, mapPanelSnapper);

    if (!setModePayload) return;

    if (mapPanelIsShown && !mapPanelIsShowing) {
      // hide pannel without any actions
      yield call(mapPanelSnapper, { index: 4 }); // hide
      yield delay(mapPanelReplaceDelay);
    }
    yield put({ type: 'UI_MAP_PANEL_SET_MODE', payload: setModePayload });

    mapPanelIsShowing = true;
    if (nextAction.type === 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET' ||
      nextAction.type === 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET'
    ) {
      yield call(mapPanelSnapper, { index: 1 }); // show half screen
    } else {
      yield call(mapPanelSnapper, { index: 0 }); // show standard
    }

    yield take('UI_MAP_PANEL_SHOW_SNAPPED');
    yield put({ type: 'UI_MAP_PANEL_SHOW_FINISHED' });
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }
}

function* getMapPanelPayload(nextAction, mapPanelSnapper) {
  let targetUserSnap = {};
  let targetUser = {};

  const myCoords = yield select((state) => state.location.coords);
  const myUid = yield select((state) => state.auth.uid);
  const mapPanelState = yield select((state) => state.mapPanel);
  const microDateState = yield select((state) => state.microDate);

  if (microDateState.microDate) {
    const targetRefPath = myUid === microDateState.microDate.requestBy ? 'requestForRef' : 'requestByRef';
    targetUserSnap = yield microDateState.microDate[targetRefPath].get();
    targetUser = {
      id: targetUserSnap.id,
      shortId: targetUserSnap.id.substring(0, 4),
      ...targetUserSnap.data(),
    };
  }

  switch (nextAction.type) {
    case 'USERS_AROUND_ITEM_PRESSED':
      if (microDateState.enabled || microDateState.pending) {
        yield call(mapPanelSnapper, { index: 0 }); // show standard
        return null;
      }
      return {
        mode: 'userCard',
        heightMode: 'standard',
        targetUser: nextAction.payload,
        canHide: true,
      };
    case 'MICRO_DATE_OUTGOING_REQUEST':
      return {
        mode: 'outgoingMicroDateAwaitingAccept',
        heightMode: 'standard',
        canHide: false,
        targetUser,
        microDate: {
          id: nextAction.payload.id,
          requestFor: nextAction.payload.requestFor,
          requestTS: nextAction.payload.requestTS,
        },
      };
    case 'MICRO_DATE_INCOMING_REQUEST':
      return {
        mode: 'incomingMicroDateRequest',
        heightMode: 'standard',
        targetUser,
        distance: GeoUtils.distance(targetUserSnap.data().geoPoint, myCoords),
        canHide: false,
        microDateId: microDateState.microDate.id,
        microDate: {
          requestTS: nextAction.payload.requestTS,
        },
      };
    case 'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET':
      return {
        mode: 'outgoingMicroDateDeclined',
        heightMode: 'standard',
        targetUser,
        canHide: true,
        microDate: microDateState.microDate,
      };
    case 'MICRO_DATE_INCOMING_CANCELLED':
      return {
        mode: 'incomingMicroDateCancelled',
        heightMode: 'standard',
        targetUser,
        canHide: true,
        microDate: microDateState.microDate,
      };
    case 'MICRO_DATE_INCOMING_STARTED':
    case 'MICRO_DATE_OUTGOING_STARTED':
      if (
        mapPanelState.mode === 'selfieUploadedByTarget' ||
        mapPanelState.mode === 'selfieUploadedByMe' ||
        mapPanelState.mode === 'selfieUploading' ||
        mapPanelState.mode === 'makeSelfie'
      ) {
        return null;
      }
      return {
        canHide: false,
        mode: 'activeMicroDate',
        heightMode: 'standard',
        targetUser,
        microDate: {
          acceptTS: nextAction.payload.acceptTS,
        },
        distance: GeoUtils.distance(targetUserSnap.data().geoPoint, myCoords),
      };
    case 'MICRO_DATE_INCOMING_ACCEPT':
    case 'MICRO_DATE_OUTGOING_ACCEPT':
      return {
        mode: 'activeMicroDate',
        heightMode: 'standard',
        targetUser,
        canHide: false,
        microDate: {
          acceptTS: nextAction.payload.acceptTS,
        },
        distance: GeoUtils.distance(targetUserSnap.data().geoPoint, myCoords),
      };
    case 'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET':
      return {
        mode: 'microDateStopped',
        heightMode: 'standard',
        targetUser,
        canHide: true,
        microDate: microDateState.microDate,
      };
    case 'MICRO_DATE_INCOMING_STOPPED_BY_TARGET':
      return {
        mode: 'microDateStopped',
        heightMode: 'standard',
        targetUser,
        canHide: true,
        microDate: microDateState.microDate,
      };
    case 'MICRO_DATE_CLOSE_DISTANCE_MOVE':
      if (
        mapPanelState.mode === 'makeSelfie' ||
        mapPanelState.previousMode === 'makeSelfie' ||
        microDateState.photoMode ||
        !microDateState.enabled
      ) {
        return null;
      }
      return {
        targetUser,
        mode: 'makeSelfie',
        heightMode: 'standard',
        canHide: false,
        source: 'MICRO_DATE_CLOSE_DISTANCE_MOVE',
      };
    case 'MICRO_DATE_UPLOAD_PHOTO_START':
      return {
        mode: 'selfieUploading',
        heightMode: 'standard',
        canHide: false,
        uploadSelfie: {
          photoURI: nextAction.payload.uri,
          aspectRatio: nextAction.payload.aspectRatio,
        },
      };
    case 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME':
    case 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME':
      return {
        targetUser,
        mode: 'selfieUploadedByMe',
        heightMode: 'standard',
        canHide: false,
        microDate: microDateState.microDate,
      };
    case 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET':
    case 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET': // show half screen
      return {
        targetUser,
        mode: 'selfieUploadedByTarget',
        heightMode: 'halfScreen',
        canHide: false,
        microDate: microDateState.microDate,
      };
    case 'MICRO_DATE_DECLINE_SELFIE_BY_ME':
    case 'MICRO_DATE_INCOMING_SELFIE_DECLINED_BY_TARGET':
    case 'MICRO_DATE_OUTGOING_SELFIE_DECLINED_BY_TARGET':
    case 'MICRO_DATE_OUTGOING_SELFIE_DECLINED_BY_ME':
    case 'MICRO_DATE_INCOMING_SELFIE_DECLINED_BY_ME':
      return {
        mode: 'makeSelfie',
        heightMode: 'standard',
        canHide: false,
        targetUser,
      };
    default:
      return null;
  }
}

function* mapPanelHideActionsSaga(mapPanelSnapper, nextAction) {
  try {
    mapPanelIsShowing = false;
    yield call(mapPanelSnapper, { index: 4 }); // hide
    yield* showAgainIfCantHide(mapPanelSnapper);
    switch (nextAction.type) {
      case 'MAPVIEW_PRESSED':
        break;
      default:
        break;
    }
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }
}

function* showAgainIfCantHide(mapPanelSnapper) {
  const canHide = yield select((state) => state.mapPanel.canHide);

  if (canHide === false) {
    yield delay(mapPanelReplaceDelay);
    mapPanelIsShowing = true;
    yield call(mapPanelSnapper, { index: 3 }); // show folded
    yield take([
      'UI_MAP_PANEL_SHOW_SNAPPED',
    ]);
  }
}

function* mapPanelForceHideActionsSaga(mapPanelSnapper, nextAction) {
  mapPanelIsShowing = false;
  yield put({ type: 'UI_MAP_PANEL_HIDE_FORCE', payload: nextAction.payload });
  yield call(mapPanelSnapper, { index: 4 }); // hide
  yield take('UI_MAP_PANEL_HIDE_SNAPPED');
  mapPanelIsShown = false;
}

function markMapPanelShown() {
  mapPanelIsShowing = false;
  mapPanelIsShown = true;
}
