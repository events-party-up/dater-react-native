import { call, take, put, cancel, select, takeLatest } from 'redux-saga/effects';
import { delay } from 'redux-saga';

const mapPanelReplaceDelay = 250;
const mapPanelHideDelay = 400;

export default function* mapPanelSaga() {
  let showingInProgress = false;

  try {
    while (true) {
      const { mapPanelSnapper } = yield take('UI_MAP_PANEL_READY');
      const task1 = yield takeLatest('UI_MAP_PANEL_SHOW', showPanel, mapPanelSnapper);
      const task2 = yield takeLatest(['UI_MAP_PANEL_HIDE', 'UI_MAP_PANEL_HIDE_FORCE'], hidePanel, mapPanelSnapper);
      const task3 = yield takeLatest('FIND_USER_START', showFindUserPanel, mapPanelSnapper);
      const task4 = yield takeLatest('UI_MAP_PANEL_HIDE_FINISHED', hideFinished, mapPanelSnapper);
      yield take('UI_MAP_PANEL_UNLOAD');
      yield cancel(task1, task2, task3, task4);
    }
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }


  function* hideFinished(mapPanelSnapper, action) {
    const canHide = yield select((state) => state.mapPanel.canHide);
    if (!canHide) {
      yield* showPanel(mapPanelSnapper, action);
    }
  }

  function* showPanel(mapPanelSnapper, action) {
    try {
      showingInProgress = true;
      const mapPanelVisible = yield select((state) => state.mapPanel.visible);
      if (mapPanelVisible) {
        yield* hidePanel(mapPanelSnapper, action);
      }
      yield put({ type: 'UI_MAP_PANEL_SHOW_FINISHED', payload: action.payload });
      const mapPanelMode = yield select((state) => state.mapPanel.mode);
      switch (mapPanelMode) {
        case 'findUserActive':
          yield call(mapPanelSnapper, { index: 0 }); // show
          break;
        default:
          yield call(mapPanelSnapper, { index: 0 }); // show
          break;
      }
      showingInProgress = false;
    } catch (error) {
      showingInProgress = false;
      yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
    }
  }

  function* hidePanel(mapPanelSnapper, action) {
    try {
      const mapPanelVisible = yield select((state) => state.mapPanel.visible);
      const canHide = yield select((state) => state.mapPanel.canHide);
      if ((showingInProgress && !mapPanelVisible)) return;
      if (action.type === 'UI_MAP_PANEL_HIDE' && !canHide) return; // non closable

      yield call(mapPanelSnapper, { index: 2 }); // hide
      if (mapPanelVisible) {
        yield call(delay, mapPanelReplaceDelay);
      } else {
        yield call(delay, mapPanelHideDelay);
      }
      yield put({ type: 'UI_MAP_PANEL_HIDE_FINISHED', payload: action.payload });
    } catch (error) {
      yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
    }
  }

  function* showFindUserPanel(mapPanelSnapper, action) {
    try {
      yield* hidePanel(mapPanelSnapper, action);
      const nextAction = {
        type: 'UI_MAP_PANEL_SET_MODE',
        payload: {
          ...action.payload,
          mode: 'findUser',
        },
      };
      yield put(nextAction);
      yield* showPanel(mapPanelSnapper, nextAction);
    } catch (error) {
      yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
    }
  }
}

