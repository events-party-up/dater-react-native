import { takeLatest, call, take, put, cancel, select, fork, delay } from 'redux-saga/effects';

import { DEFAULT_MAPVIEW_ANIMATION_DURATION } from '../../constants';

export default function* mapViewSaga() {
  try {
    while (true) {
      const { mapView } = yield take('MAPVIEW_READY');
      const eventsTask = yield fork(mapViewEventsSaga, mapView);

      yield put({ type: 'MAPVIEW_MAIN_SAGA_READY' });
      yield take('MAPVIEW_UNLOAD');
      yield cancel(eventsTask);
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_MAINSAGA_ERROR', payload: error });
  }
}

function* mapViewEventsSaga(mapView) {
  while (true) {
    const appStateIsBackground = yield select((state) => state.appState.state === 'background');
    if (appStateIsBackground) {
      yield take('APP_STATE_ACTIVE'); // do not process mapView tasks when app is in background!
    }
    const task1 = yield takeLatest('MAPVIEW_SET_CAMERA', setCamera, mapView);
    const task2 = yield takeLatest('MAPVIEW_MOVE_TO', moveTo, mapView);
    const task3 = yield takeLatest('MAPVIEW_ZOOM_TO', zoomTo, mapView);
    const task4 = yield takeLatest([
      'MAPVIEW_ANIMATE_TO_HEADING_MANUALLY',
      'MAPVIEW_ANIMATE_TO_HEADING_GPS_HEADING',
      'MAPVIEW_ANIMATE_TO_HEADING_COMPASS_HEADING'], animateToHeading, mapView);
    const task5 = yield takeLatest('MAPVIEW_SHOW_MY_LOCATION', showMyLocation);
    const task6 = yield takeLatest('MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME', showMyLocationAndCenterMe);
    const task7 = yield takeLatest('MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE', showMeAndTargetMicroDate, mapView);
    const task8 = yield fork(switchMapViewMode, mapView);
    const zoom = yield select((state) => state.mapView.zoom);

    yield put({
      type: 'MAPVIEW_SHOW_MY_LOCATION',
      payload: {
        zoom,
        caller: 'mapViewEventsSaga',
      },
    });

    yield take('APP_STATE_BACKGROUND'); // do not process mapView tasks when app is in background!
    yield cancel(task1, task2, task3, task4, task5, task6, task7, task8);
  }
}

function* animateToHeading(mapView, action) {
  try {
    const { duration, heading } = action.payload;
    const animationDuration = duration || DEFAULT_MAPVIEW_ANIMATION_DURATION;
    yield call(mapView.animateToHeading, heading, animationDuration);
  } catch (error) {
    yield put({ type: 'MAPVIEW_ANIMATE_TO_HEADING_ERROR', payload: error });
  }
}

function* setCamera(mapView, action) {
  try {
    const options = action.payload;
    const duration = options.duration || DEFAULT_MAPVIEW_ANIMATION_DURATION;
    yield mapView.setCamera({
      ...options,
      duration,
    });
  } catch (error) {
    yield put({ type: 'MAPVIEW_SET_CAMERA_ERROR', payload: error });
  }
}

function* moveTo(mapView, action) {
  try {
    const { coords, duration } = action.payload;
    const animationDuration = duration || DEFAULT_MAPVIEW_ANIMATION_DURATION;
    yield call(mapView.moveTo, [coords.longitude, coords.latitude], animationDuration);
  } catch (error) {
    yield put({ type: 'MAPVIEW_MOVE_TO_ERROR', payload: error });
  }
}

function* zoomTo(mapView, action) {
  try {
    const mapViewState = yield select((state) => state.mapView);
    const { zoom, duration } = action.payload;
    const animationDuration = duration || DEFAULT_MAPVIEW_ANIMATION_DURATION;
    yield mapView.setCamera({
      zoom,
      duration: animationDuration,
      latitude: mapViewState.latitude,
      longitude: mapViewState.longitude,
      heading: mapViewState.heading,
    });
  } catch (error) {
    yield put({ type: 'MAPVIEW_ZOOM_TO_ERROR', payload: error });
  }
}

function* fitBounds(mapView, coords1: Array<number>, coords2: Array<number>) {
  try {
    yield call(mapView.fitBounds, coords1, coords2, 80, DEFAULT_MAPVIEW_ANIMATION_DURATION);
  } catch (error) {
    yield put({ type: 'MAPVIEW_FIT_TO_BOUNDS_ERROR', payload: error });
  }
}

function* showMeAndTargetMicroDate(mapView) {
  try {
    const lastTargetUserCoords = yield select((state) => state.microDate.targetCurrentCoords);
    const myLastCoords = yield select((state) => state.location.coords);
    yield call(
      fitBounds,
      mapView,
      [lastTargetUserCoords.longitude, lastTargetUserCoords.latitude],
      [myLastCoords.longitude, myLastCoords.latitude],
    );
  } catch (error) {
    yield put({ type: 'MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE_ERROR', payload: error });
  }
}

function* showMyLocation(action) {
  try {
    const coords = yield select((state) => state.location.coords);
    if (!coords) return;

    const showMyLocationMapAnimationDuration = 500;
    yield put({
      type: 'MAPVIEW_SET_CAMERA',
      payload: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        [action.payload && action.payload.zoom && 'zoom']: action.payload && action.payload.zoom,
        duration: showMyLocationMapAnimationDuration,
      },
    });
    yield delay(showMyLocationMapAnimationDuration);
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_FINISH' });
  } catch (error) {
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_ERROR', payload: error });
  }
}

function* showMyLocationAndCenterMe(action) {
  try {
    const coords = yield select((state) => state.location.coords);
    if (!coords) return;
    const showMyLocationMapAnimationDuration = 500;
    yield put({
      type: 'MAPVIEW_SET_CAMERA',
      payload: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        [action.payload && action.payload.zoom && 'zoom']: action.payload && action.payload.zoom,
        [action.payload && action.payload.heading && 'heading']: action.payload && action.payload.heading,
        duration: showMyLocationMapAnimationDuration,
      },
    });
    yield delay(showMyLocationMapAnimationDuration);
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME_FINISH' });
  } catch (error) {
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_ERROR', payload: error });
  }
}

function* switchMapViewMode(mapView) {
  let myCoords;
  const zoomAnimationDuration = 500;

  try {
    while (true) {
      yield take('MAPVIEW_SWITCH_VIEW_MODE_START');

      // zoom out on myself
      myCoords = yield select((state) => state.location.coords);
      yield call(mapView.setCamera, {
        ...myCoords,
        zoom: 14,
        duration: zoomAnimationDuration,
      });
      yield delay(zoomAnimationDuration); // allow map finish switching
      yield put({ type: 'MAPVIEW_SWITCH_VIEW_MODE_FINISH', payload: 'zoomOut' });

      // zoom in on myself
      yield take('MAPVIEW_SWITCH_VIEW_MODE_START');
      myCoords = yield select((state) => state.location.coords);
      yield call(mapView.setCamera, {
        ...myCoords,
        zoom: 17,
        duration: zoomAnimationDuration,
      });
      yield delay(zoomAnimationDuration); // allow map finish switching
      yield put({ type: 'MAPVIEW_SWITCH_VIEW_MODE_FINISH', payload: 'zoomIn' });
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_SWITCH_VIEW_MODE_ERROR', payload: error });
  }
}
