import { call, take, put, actionChannel, cancel, takeLatest, select } from 'redux-saga/effects';
import { buffers, delay } from 'redux-saga';

import GeoUtils from '../utils/geo-utils';

const mapPanelReplaceDelay = 250;
// const mapPanelHideDelay = 400;

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
      ], buffers.none());

      const hideActions = yield actionChannel([
        'MAPVIEW_PRESSED',
        'MICRO_DATE_OUTGOING_REQUEST_INIT',
      ], buffers.none());

      const forceHideActions = yield actionChannel([
        'MICRO_DATE_OUTGOING_CANCEL',
        'MICRO_DATE_INCOMING_DECLINE_BY_ME',
        'MICRO_DATE_STOP',
        'MICRO_DATE_DECLINE_SELFIE_BY_ME',
        'MICRO_DATE_APPROVE_SELFIE',
        'MICRO_DATE_INCOMING_ACCEPT',
        'MICRO_DATE_INCOMING_REMOVE',
        'MICRO_DATE_INCOMING_FINISHED',
        'MICRO_DATE_OUTGOING_REMOVE',
        'MICRO_DATE_OUTGOING_FINISHED',
      ]);

      const task1 = yield takeLatest(showActions, mapPanelShowActionsSaga, mapPanelSnapper);
      const task2 = yield takeLatest(hideActions, mapPanelHideActionsSaga, mapPanelSnapper);
      const task3 = yield takeLatest(forceHideActions, mapPanelForceHideActionsSaga, mapPanelSnapper);
      const task4 = yield takeLatest('UI_MAP_PANEL_HIDE_SNAPPED', hideSnappedSaga, mapPanelSnapper);

      yield take('UI_MAP_PANEL_UNLOAD');
      yield cancel(task1, task2, task3, task4);
    }
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }
}


function* mapPanelShowActionsSaga(mapPanelSnapper, nextAction) {
  let userSnap = {};
  let targetUser;

  try {
    const microDateState = yield select((state) => state.microDate);
    const myCoords = yield select((state) => state.location.coords);

    if (microDateState.microDate) {
      userSnap = yield microDateState.microDate.requestByRef.get();
      targetUser = {
        id: userSnap.id,
        shortId: userSnap.id.substring(0, 4),
        ...userSnap.data(),
      };
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
            distance: GeoUtils.distance(userSnap.data().geoPoint, myCoords),
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
            canHide: true,
            microDate: microDateState.microDate,
          },
        });
        break;
      default:
        break;
    }

    const mapPanelVisible = yield select((state) => state.mapPanel.visible);
    if (mapPanelVisible) {
      // hide pannel without any actions
      yield call(mapPanelSnapper, { index: 3 }); // hide
      yield call(delay, mapPanelReplaceDelay);
    }

    yield call(mapPanelSnapper, { index: 0 }); // show
    yield take('UI_MAP_PANEL_SHOW_SNAPPED');
    yield put({ type: 'UI_MAP_PANEL_SHOW_FINISHED', payload: nextAction.payload });
    yield take('UI_MAP_PANEL_HIDE');
    yield call(mapPanelSnapper, { index: 3 }); // hide
    yield take('UI_MAP_PANEL_HIDE_SNAPPED');
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }
}

function* mapPanelHideActionsSaga(mapPanelSnapper, nextAction) {
  try {
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

function* hideSnappedSaga(mapPanelSnapper) {
  yield* showAgainIfCantHide(mapPanelSnapper);
}

function* showAgainIfCantHide(mapPanelSnapper) {
  const canHide = yield select((state) => state.mapPanel.canHide);
  if (canHide === false) {
    yield call(delay, mapPanelReplaceDelay);
    yield call(mapPanelSnapper, { index: 0 }); // show
    yield take('UI_MAP_PANEL_SHOW_SNAPPED');
  }
}

function* mapPanelForceHideActionsSaga(mapPanelSnapper, nextAction) {
  yield put({ type: 'UI_MAP_PANEL_HIDE_FORCE', payload: nextAction.payload });
  yield call(mapPanelSnapper, { index: 3 }); // hide
  yield take('UI_MAP_PANEL_HIDE_SNAPPED');
}
