import { call, take, put, actionChannel, cancel, takeLatest, select, throttle, delay } from 'redux-saga/effects';
import { buffers } from 'redux-saga';

import GeoUtils from '../../utils/geo-utils';

const mapPanelReplaceDelay = 250;
let mapPanelIsShowing = false;
let mapPanelIsShown = false;

export default function* mapPanelSagaNew() {
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

      yield take('UI_MAP_PANEL_UNLOAD');
      yield cancel(throttledActionsTask, task1, task2, task3, task4);
    }
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }
}

function* mapPanelShowActionsSaga(mapPanelSnapper, nextAction) {
  let targetUserSnap = {};
  let targetUser;
  try {
    const microDateState = yield select((state) => state.microDate);
    const mapPanelState = yield select((state) => state.mapPanel);
    const myCoords = yield select((state) => state.location.coords);
    const myUid = yield select((state) => state.auth.uid);

    if (mapPanelState.mode === mapPanelState.previousMode === 'makeSelfie') {
      return;
    }

    if (microDateState.microDate) {
      const targetRefPath = myUid === microDateState.microDate.requestBy ? 'requestForRef' : 'requestByRef';
      targetUserSnap = yield microDateState.microDate[targetRefPath].get();
      targetUser = {
        id: targetUserSnap.id,
        shortId: targetUserSnap.id.substring(0, 4),
        ...targetUserSnap.data(),
      };
    }

    if (mapPanelIsShown && !mapPanelIsShowing) {
      // hide pannel without any actions
      yield call(mapPanelSnapper, { index: 4 }); // hide
      yield delay(mapPanelReplaceDelay);
    }

    switch (nextAction.type) {
      case 'USERS_AROUND_ITEM_PRESSED':
        if (!microDateState.enabled && !microDateState.pending) {
          yield put({
            type: 'UI_MAP_PANEL_SET_MODE',
            payload: {
              mode: 'userCard',
              targetUser: nextAction.payload,
              canHide: true,
            },
          });
        }
        break;
      case 'MICRO_DATE_OUTGOING_REQUEST':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'outgoingMicroDateAwaitingAccept',
            canHide: false,
            targetUser,
            microDate: {
              id: nextAction.payload.id,
              requestFor: nextAction.payload.requestFor,
              requestTS: nextAction.payload.requestTS,
            },
          },
        });
        break;
      case 'MICRO_DATE_INCOMING_REQUEST':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'incomingMicroDateRequest',
            targetUser,
            distance: GeoUtils.distance(targetUserSnap.data().geoPoint, myCoords),
            canHide: false,
            microDateId: microDateState.microDate.id,
          },
        });
        break;
      case 'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'outgoingMicroDateDeclined',
            targetUser,
            canHide: true,
            microDate: microDateState.microDate,
          },
        });
        break;
      case 'MICRO_DATE_INCOMING_CANCELLED':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'incomingMicroDateCancelled',
            targetUser,
            canHide: true,
            microDate: microDateState.microDate,
          },
        });
        break;
      case 'MICRO_DATE_INCOMING_STARTED':
        if (
          mapPanelState.mode === 'selfieUploadedByTarget' ||
            mapPanelState.mode === 'selfieUploadedByMe' ||
            mapPanelState.mode === 'selfieUploading' ||
            mapPanelState.mode === 'makeSelfie'
        ) {
          return;
        }
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            canHide: true,
            mode: 'activeMicroDate',
            targetUser,
            distance: GeoUtils.distance(targetUserSnap.data().geoPoint, myCoords),
          },
        });
        break;
      case 'MICRO_DATE_INCOMING_ACCEPT':
      case 'MICRO_DATE_OUTGOING_ACCEPT':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'activeMicroDate',
            targetUser,
            canHide: true,
            distance: GeoUtils.distance(targetUserSnap.data().geoPoint, myCoords),
          },
        });
        break;
      case 'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'microDateStopped',
            targetUser,
            canHide: true,
            microDate: microDateState.microDate,
          },
        });
        break;
      case 'MICRO_DATE_INCOMING_STOPPED_BY_TARGET':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'microDateStopped',
            targetUser,
            canHide: true,
            microDate: microDateState.microDate,
          },
        });
        break;
      case 'MICRO_DATE_CLOSE_DISTANCE_MOVE':
        if (
          mapPanelState.mode === 'makeSelfie' ||
          mapPanelState.previousMode === 'makeSelfie' ||
          microDateState.photoMode ||
          !microDateState.enabled
        ) {
          return;
        }
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            targetUser,
            mode: 'makeSelfie',
            canHide: false,
            source: 'MICRO_DATE_CLOSE_DISTANCE_MOVE',
          },
        });

        yield put({ type: 'HAPTICFEEDBACK_HEAVY' });
        break;
      case 'MICRO_DATE_UPLOAD_PHOTO_START':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'selfieUploading',
            canHide: false,
            uploadSelfie: {
              photoURI: nextAction.payload.uri,
              aspectRatio: nextAction.payload.aspectRatio,
            },
          },
        });
        break;
      case 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME':
      case 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            targetUser,
            mode: 'selfieUploadedByMe',
            canHide: false,
            microDate: microDateState.microDate,
          },
        });
        break;
      case 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET':
      case 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            targetUser,
            mode: 'selfieUploadedByTarget',
            canHide: false,
            microDate: microDateState.microDate,
          },
        });
        yield call(mapPanelSnapper, { index: 1 }); // show half screen
        return;
      case 'MICRO_DATE_DECLINE_SELFIE_BY_ME':
      case 'MICRO_DATE_INCOMING_SELFIE_DECLINED_BY_TARGET':
      case 'MICRO_DATE_OUTGOING_SELFIE_DECLINED_BY_TARGET':
      case 'MICRO_DATE_OUTGOING_SELFIE_DECLINED_BY_ME':
      case 'MICRO_DATE_INCOMING_SELFIE_DECLINED_BY_ME':
        yield put({
          type: 'UI_MAP_PANEL_SET_MODE',
          payload: {
            mode: 'makeSelfie',
            canHide: false,
            targetUser,
          },
        });
        break;
      default:
        break;
    }
    mapPanelIsShowing = true;
    yield call(mapPanelSnapper, { index: 0 }); // show
    yield take('UI_MAP_PANEL_SHOW_SNAPPED');
    mapPanelIsShowing = false;
    yield put({ type: 'UI_MAP_PANEL_SHOW_FINISHED' });
    mapPanelIsShown = true;
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
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
  const mapPanelMode = yield select((state) => state.mapPanel.mode);

  if (canHide === false) {
    yield delay(mapPanelReplaceDelay);
    mapPanelIsShowing = true;
    switch (mapPanelMode) {
      case 'selfieUploadedByTarget':
        yield call(mapPanelSnapper, { index: 1 }); // show half screen
        break;
      default:
        yield call(mapPanelSnapper, { index: 3 }); // show folded
        break;
    }
    yield take([
      'UI_MAP_PANEL_SHOW_SNAPPED',
      'UI_MAP_PANEL_SHOW_HALF_SCREEN_SNAPPED',
    ]);
    mapPanelIsShowing = false;
    mapPanelIsShown = true;
  }
}

function* mapPanelForceHideActionsSaga(mapPanelSnapper, nextAction) {
  mapPanelIsShowing = false;
  yield put({ type: 'UI_MAP_PANEL_HIDE_FORCE', payload: nextAction.payload });
  yield call(mapPanelSnapper, { index: 4 }); // hide
  yield take('UI_MAP_PANEL_HIDE_SNAPPED');
  mapPanelIsShown = false;
}
