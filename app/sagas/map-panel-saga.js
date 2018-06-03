import { call, take, put, cancel, select, takeLatest, END } from 'redux-saga/effects';
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
      const task3 = yield takeLatest('UI_MAP_PANEL_HIDE_FINISHED', hideFinished, mapPanelSnapper);
      yield take('UI_MAP_PANEL_UNLOAD');
      yield cancel(task1, task2, task3);
    }
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }

  function* hideFinished(mapPanelSnapper, action) {
    const canHide = yield select((state) => state.mapPanel.canHide);
    const mapPanelVisible = yield select((state) => state.mapPanel.visible);

    if (!canHide && !mapPanelVisible) {
      yield put({ type: 'UI_MAP_PANEL_SHOW', payload: action.payload });
    }
  }

  function* showPanel(mapPanelSnapper, action) {
    try {
      showingInProgress = true;
      const mapPanelPreviousMode = yield select((state) => state.mapPanel.previousMode);
      const mapPanelVisible = yield select((state) => state.mapPanel.visible);
      const pendingShow = yield select((state) => state.mapPanel.pendingShow);

      if (mapPanelVisible && mapPanelPreviousMode !== action.payload.mode && !pendingShow) {
        // hide pannel without any actions
        yield call(mapPanelSnapper, { index: 3 }); // hide
        yield call(delay, mapPanelReplaceDelay);
      }
      const mapPanelMode = action.payload && action.payload.mode ?
        action.payload.mode : yield select((state) => state.mapPanel.mode);

      switch (mapPanelMode) {
        case 'activeMicroDate':
          if (
            mapPanelMode === 'makeSelfie' ||
            mapPanelMode === 'selfieUploadedByTarget' ||
            mapPanelMode === 'selfieUploadedByMe' ||
            mapPanelMode === 'selfieUploading') {
            return;
          }
          yield call(mapPanelSnapper, { index: 0 }); // show
          break;
        case 'selfieUploading':
          yield call(mapPanelSnapper, { index: 0 }); // show
          break;
        case 'selfieUploadedByTarget':
          yield call(mapPanelSnapper, { index: 1 }); // show
          break;
        case 'makeSelfie':
          if (
            // mapPanelMode === 'makeSelfie' ||
            mapPanelMode === 'selfieUploadedByTarget' ||
            mapPanelMode === 'selfieUploadedByMe' ||
            mapPanelMode === 'selfieUploading') {
            return;
          }
          yield call(mapPanelSnapper, { index: 0 }); // show
          break;
        default:
          yield call(mapPanelSnapper, { index: 0 }); // show
          break;
      }
      showingInProgress = false;
      yield put({ type: 'UI_MAP_PANEL_SHOW_FINISHED', payload: action.payload });
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

      yield call(mapPanelSnapper, { index: 3 }); // hide
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
}

