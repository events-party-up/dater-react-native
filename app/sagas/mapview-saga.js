import { throttle, takeLatest, call, take, put, cancel, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';
import {
  DEFAULT_MAPVIEW_ANIMATION_DURATION,
  DEFAULT_LATITUDE_DELTA,
  DEFAULT_LONGITUDE_DELTA,
} from '../constants';

export default function* mapViewSaga() {
  try {
    while (true) {
      const { mapView } = yield take('MAPVIEW_READY');
      const task1 = yield takeLatest('MAPVIEW_ANIMATE_TO_REGION', animateToRegion, mapView);
      const task2 = yield takeLatest('MAPVIEW_ANIMATE_TO_COORDINATE', animateToCoordinate, mapView);
      const task3 = yield throttle(1000, [
        'MAPVIEW_ANIMATE_TO_BEARING_MANUALLY',
        'MAPVIEW_ANIMATE_TO_BEARING_GPS_HEADING',
        'MAPVIEW_ANIMATE_TO_BEARING_COMPASS_HEADING'], animateToBearing, mapView);
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

function* animateToBearing(mapView, action) {
  try {
    const { duration, bearingAngle } = action.payload;
    const animationDuration = duration || DEFAULT_MAPVIEW_ANIMATION_DURATION;
    yield call(mapView.animateToBearing, bearingAngle, animationDuration);
  } catch (error) {
    yield put({ type: 'MAPVIEW_ANIMATE_TO_BEARING_ERROR', payload: error });
  }
}

function* animateToRegion(mapView, action) {
  try {
    const { region, duration } = action.payload;
    const animationDuration = duration || DEFAULT_MAPVIEW_ANIMATION_DURATION;
    yield call(mapView.animateToRegion, region, animationDuration);
  } catch (error) {
    yield put({ type: 'MAPVIEW_ANIMATE_TO_REGION_ERROR', payload: error });
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

function* showMyLocation(mapView) {
  try {
    const coords = yield select((state) => state.location.coords);
    yield call(mapView.animateToCoordinate, coords, DEFAULT_MAPVIEW_ANIMATION_DURATION);
    yield call(delay, DEFAULT_MAPVIEW_ANIMATION_DURATION);

    yield put({
      type: 'MAPVIEW_ANIMATE_TO_REGION',
      payload: {
        region: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: DEFAULT_LATITUDE_DELTA,
          longitudeDelta: DEFAULT_LONGITUDE_DELTA,
        },
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
