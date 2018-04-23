import { call, take, put, cancel, fork } from 'redux-saga/effects';

export default function* mapPanelSaga() {
  try {
    while (true) {
      const { mapPanelSnapper } = yield take('UI_MAP_PANEL_READY');
      // const task1 = yield takeEvery('UI_MAP_PANEL_SHOW_START', showPanel, mapPanelSnapper);

      const task1 = yield fork(handlePanelOpensSaga, mapPanelSnapper);
      yield take('UI_MAP_PANEL_UNLOAD');
      yield cancel(task1);
    }
  } catch (error) {
    yield put({ type: 'UI_MAP_PANEL_ERROR', payload: error });
  }
}

function* handlePanelOpensSaga(mapPanelSnapper) {
  while (true) {
    yield take('UI_MAP_PANEL_SHOW_START');
    yield* showPanel(mapPanelSnapper);
    const nextAction = yield take(['UI_MAP_PANEL_HIDE_START', 'FIND_USER_STARTED', 'FIND_USER_STOP']);

    if (nextAction.type === 'FIND_USER_STARTED') {
      yield* hidePanel(mapPanelSnapper);
      yield put({
        type: 'UI_MAP_PANEL_SET_MODE',
        payload: {
          mode: 'findUser',
          user: nextAction.payload.user,
          startDistance: nextAction.payload.startDistance,
        },
      });
      yield* showPanel(mapPanelSnapper);
      yield take('UI_MAP_PANEL_HIDE_START');
      yield* hidePanel(mapPanelSnapper);
    } else if (nextAction.type === 'UI_MAP_PANEL_HIDE_START' || 'FIND_USER_STOP') {
      yield* hidePanel(mapPanelSnapper);
    }
    // const mapPanelVisible = yield select((state) => state.mapPanel.visible);
    // if (!mapPanelVisible) {
    // }
  }
}


function* showPanel(mapPanelSnapper) {
  yield call(mapPanelSnapper, { index: 0 }); // show
  yield take('UI_MAP_PANEL_SHOW_FINISHED');
}

function* hidePanel(mapPanelSnapper) {
  yield call(mapPanelSnapper, { index: 1 }); // hide
  yield take('UI_MAP_PANEL_HIDE_FINISHED');
}

// function* showPanel(mapPanelSnapper, action) {
//   yield call(mapPanelSnapper, { index: 0 }); // show
//   yield put({
//     type: 'UI_MAP_PANEL_SHOW_FINISH',
//     payload: action.payload,
//   });

//   const task2 = yield takeEvery('UI_MAP_PANEL_REPLACE_START', replacePanel, mapPanelSnapper);

//   yield take('UI_MAP_PANEL_HIDE_START');
//   yield cancel(task2);
//   yield call(mapPanelSnapper, { index: 1 }); // hide
//   yield take('UI_MAP_PANEL_SNAP_CLOSE_FINISHED');
//   yield put({ type: 'UI_MAP_PANEL_HIDE_FINISH' });
// }

// function* replacePanel(mapPanelSnapper, action) {
//   yield call(mapPanelSnapper, { index: 1 }); // hide
//   const mapPanelVisible = yield select((state) => state.mapPanel.visible);
//   if (!mapPanelVisible) {
//     yield take('UI_MAP_PANEL_SNAP_CLOSE_FINISHED');
//   }

//   yield put({
//     type: 'UI_MAP_PANEL_REPLACE_FINISH',
//     payload: action.payload,
//   });
//   yield call(mapPanelSnapper, { index: 0 }); // show
// }
