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
        'MICRO_DATE_ASK_ARE_YOU_READY',
        'MICRO_DATE_IM_READY',
        'MICRO_DATE_START',
        'MICRO_DATE_STOPPED_BY_TARGET',
        'MICRO_DATE_UPLOAD_PHOTO_START',
        'MICRO_DATE_SELFIE_UPLOADED_BY_ME',
        'MICRO_DATE_SELFIE_UPLOADED_BY_TARGET',
        'MICRO_DATE_SELFIE_DECLINED_BY_TARGET',
        'MICRO_DATE_SELFIE_DECLINED_BY_ME',
        'MICRO_DATE_IM_READY_EXPIRED',
        'MICRO_DATE_EXPIRED',
      ], buffers.none());

      const hideActions = yield actionChannel([
        'MAPVIEW_PRESSED',
        'MICRO_DATE_OUTGOING_REQUEST_INIT',
        'USERS_AROUND_ITEM_DESELECTED',
      ], buffers.none());

      const forceHideActions = yield actionChannel([
        'MICRO_DATE_STOP',
        'MICRO_DATE_APPROVE_SELFIE',
        'MICRO_DATE_REMOVE',
        'MICRO_DATE_FINISHED',
        'MICRO_DATE_DECLINE_SELFIE_BY_ME',
        'MICRO_DATE_UPLOAD_PHOTO_START',
        'MICRO_DATE_APPROVE_SELFIE',
        'UI_MAP_PANEL_HIDE_WITH_BUTTON',
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
      yield call(mapPanelSnapper, { index: 3 }); // hide
      yield delay(mapPanelReplaceDelay);
    }
    yield put({ type: 'UI_MAP_PANEL_SET_MODE', payload: setModePayload });

    mapPanelIsShowing = true;
    if (nextAction.type === 'MICRO_DATE_SELFIE_UPLOADED_BY_TARGET') {
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
  const myCoords = yield select((state) => state.location.coords);
  const mapPanelState = yield select((state) => state.mapPanel);
  const microDateState = yield select((state) => state.microDate);

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
    case 'MICRO_DATE_PENDING_SEARCH_CANCEL':
    case 'MICRO_DATE_ASK_ARE_YOU_READY':
      return {
        mode: 'areYouReady',
        heightMode: 'standard',
        gender: yield select((state) => state.currentUser.gender),
        canHide: false,
      };
    case 'MICRO_DATE_IM_READY':
      return {
        mode: 'pendingSearch',
        heightMode: 'standard',
        canHide: false,
      };
    case 'MICRO_DATE_IM_READY_EXPIRED':
      return {
        mode: 'iAmReadyExpired',
        heightMode: 'standard',
        canHide: true,
      };
    case 'MICRO_DATE_EXPIRED':
      return {
        mode: 'microDatetExpired',
        heightMode: 'standard',
        targetUser: nextAction.payload.targetUser,
        canHide: true,
      };
    case 'MICRO_DATE_START':
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
        targetUser: nextAction.payload.targetUser,
        microDate: {
          acceptTS: nextAction.payload.acceptTS,
        },
        distance: GeoUtils.distance(nextAction.payload.targetUser.geoPoint, myCoords),
      };
    case 'MICRO_DATE_STOPPED_BY_TARGET':
      return {
        mode: 'microDateStopped',
        heightMode: 'standard',
        targetUser: nextAction.payload.targetUser,
        canHide: true,
        microDate: microDateState,
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
        targetUser: nextAction.payload.targetUser,
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
    case 'MICRO_DATE_SELFIE_UPLOADED_BY_ME':
      return {
        targetUser: nextAction.payload.targetUser,
        mode: 'selfieUploadedByMe',
        heightMode: 'standard',
        canHide: false,
        microDate: nextAction.payload,
      };
    case 'MICRO_DATE_SELFIE_UPLOADED_BY_TARGET':
      return {
        targetUser: nextAction.payload.targetUser,
        mode: 'selfieUploadedByTarget',
        heightMode: 'halfScreen',
        canHide: false,
        microDate: nextAction.payload,
      };
    case 'MICRO_DATE_SELFIE_DECLINED_BY_TARGET':
    case 'MICRO_DATE_SELFIE_DECLINED_BY_ME':
      return {
        mode: 'makeSelfie',
        heightMode: 'standard',
        canHide: false,
        targetUser: nextAction.payload.targetUser,
      };
    default:
      return null;
  }
}

function* mapPanelHideActionsSaga(mapPanelSnapper, nextAction) {
  try {
    mapPanelIsShowing = false;
    yield call(mapPanelSnapper, { index: 3 }); // hide
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
    yield call(mapPanelSnapper, { index: 0 }); // show folded
    yield take([
      'UI_MAP_PANEL_SHOW_SNAPPED',
    ]);
  }
}

function* mapPanelForceHideActionsSaga(mapPanelSnapper, nextAction) {
  mapPanelIsShowing = false;
  yield put({ type: 'UI_MAP_PANEL_HIDE_FORCE', payload: nextAction.payload });
  yield call(mapPanelSnapper, { index: 3 }); // hide
  yield take('UI_MAP_PANEL_HIDE_SNAPPED');
  mapPanelIsShown = false;
}

function markMapPanelShown() {
  mapPanelIsShowing = false;
  mapPanelIsShown = true;
}
