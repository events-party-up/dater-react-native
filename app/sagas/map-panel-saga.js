import { takeEvery, call, take, put, cancel } from 'redux-saga/effects';
import { delay } from 'redux-saga';

const defaultAnimationDuration = 500;

export default function* mapPanelSaga() {
  try {
    while (true) {
      const { mapPanelSnapper } = yield take('UI_MAP_PANEL_READY');
      const task1 = yield takeEvery('UI_MAP_PANEL_SHOW_START', showPanel, mapPanelSnapper);
      yield take('UI_MAP_PANEL_UNLOAD');
      yield cancel(task1);
    }
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }
}

function* showPanel(mapPanelSnapper, action) {
  const user = action.payload;
  yield call(mapPanelSnapper, { index: 0 }); // show
  yield put({
    type: 'UI_MAP_PANEL_SHOW_FINISH',
    payload: user,
  });

  const task2 = yield takeEvery('UI_MAP_PANEL_REPLACE', replacePanel, mapPanelSnapper);

  yield take('UI_MAP_PANEL_HIDE_START');
  yield cancel(task2);
  yield call(mapPanelSnapper, { index: 2 }); // hide
  yield delay(defaultAnimationDuration);
  yield put({ type: 'UI_MAP_PANEL_HIDE_FINISH' });
}

function* replacePanel(mapPanelSnapper, action) {
  const user = action.payload;
  yield call(mapPanelSnapper, { index: 2 }); // first hide
  yield delay(defaultAnimationDuration);
  yield put({
    type: 'UI_MAP_PANEL_REPLACE_FINISH',
    payload: user,
  });
  yield call(mapPanelSnapper, { index: 0 }); // and show again
}
