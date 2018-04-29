import { throttle, takeLatest, call, take, put, cancel, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import { DEFAULT_MAPVIEW_ANIMATION_DURATION } from '../constants';

export default function* mapViewSaga() {
  try {
    while (true) {
      const { mapView } = yield take('MAPVIEW_READY');
      const task1 = yield takeLatest('MAPVIEW_SET_CAMERA', setCamera, mapView);
      const task2 = yield takeLatest('MAPVIEW_ANIMATE_TO_COORDINATE', animateToCoordinate, mapView);
      const task3 = yield throttle(1000, [
        'MAPVIEW_ANIMATE_TO_HEADING_MANUALLY',
        'MAPVIEW_ANIMATE_TO_HEADING_GPS_HEADING',
        'MAPVIEW_ANIMATE_TO_HEADING_COMPASS_HEADING'], animateToHeading, mapView);
      const task4 = yield takeLatest('MAPVIEW_SHOW_MY_LOCATION_START', showMyLocation, mapView);
      const task5 = yield takeLatest('MAPVIEW_SHOW_ME_AND_TARTET_FIND_USER', showMeAndTargetFindUser, mapView);
      yield put({ type: 'MAPVIEW_MAIN_SAGA_READY' });
      yield take('MAPVIEW_UNLOAD');
      yield cancel(task1, task2, task3, task4, task5);
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_MAINSAGA_ERROR', payload: error });
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
    yield call(mapView.setCamera, {
      ...options,
      duration,
    });
  } catch (error) {
    yield put({ type: 'MAPVIEW_SET_CAMERA_ERROR', payload: error });
  }
}

function* animateToCoordinate(mapView, action) {
  try {
    const { coords, duration } = action.payload;
    const animationDuration = duration || DEFAULT_MAPVIEW_ANIMATION_DURATION;
    yield call(mapView.animateToCoordinate, coords, animationDuration);
  } catch (error) {
    yield put({ type: 'MAPVIEW_ANIMATE_TO_COORDINATE_ERROR', payload: error });
  }
}

function* showMeAndTargetFindUser(mapView) {
  try {
    const lastTargetUserCoords = yield select((state) => state.findUser.targetPastCoords.pop());
    const myLastCoords = yield select((state) => state.location.coords);
    yield call(fitToCoordinates, mapView, [lastTargetUserCoords, myLastCoords]);
  } catch (error) {
    yield put({ type: 'MAPVIEW_FIT_TO_COORDS_ERROR', payload: error });
  }
}

function* fitToCoordinates(mapView, coords) {
  try {
    yield call(mapView.fitToCoordinates, coords, {
      animated: false,
      edgePadding: {
        top: 50,
        right: 50,
        bottom: 50,
        left: 50,
      },
    });
  } catch (error) {
    yield put({ type: 'MAPVIEW_FIT_TO_COORDS_ERROR', payload: error });
  }
}

function* showMyLocation() {
  try {
    const coords = yield select((state) => state.location.coords);
    yield put({
      type: 'MAPVIEW_SET_CAMERA',
      payload: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        zoom: 17,
        duration: DEFAULT_MAPVIEW_ANIMATION_DURATION,
      },
    });

    yield call(delay, DEFAULT_MAPVIEW_ANIMATION_DURATION);
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_FINISH' });
    yield put({ type: 'GEO_LOCATION_FORCE_UPDATE' });
  } catch (error) {
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_ERROR', payload: error });
  }
}
