import { throttle, takeEvery, call, take, put, cancel } from 'redux-saga/effects';
import { delay } from 'redux-saga';

const defaultAnimationDuration = 500;

export default function* mapViewSaga() {
  try {
    while (true) {
      const { mapView } = yield take('MAPVIEW_READY');
      // need to wait for the first MAPVIEW_ANIMATE_TO_REGION action first
      // otherwise MAPVIEW_ANIMATE_TO_COORDINATE will interfer with MAPVIEW_ANIMATE_TO_REGION
      // and will not allow correct zoom on map load
      const firstAnimateToRegionAction = yield take('MAPVIEW_ANIMATE_TO_REGION', animateToRegion, mapView);
      yield animateToRegion(mapView, firstAnimateToRegionAction);
      yield call(delay, defaultAnimationDuration);
      const task1 = yield takeEvery('MAPVIEW_ANIMATE_TO_REGION', animateToRegion, mapView);
      const task2 = yield takeEvery('MAPVIEW_ANIMATE_TO_COORDINATE', animateToCoordinate, mapView);
      const task3 = yield throttle(1000, [
        'MAPVIEW_ANIMATE_TO_BEARING_MANUALLY',
        'MAPVIEW_ANIMATE_TO_BEARING_GPS_HEADING',
        'MAPVIEW_ANIMATE_TO_BEARING_COMPASS_HEADING'], animateToBearing, mapView);
      const task4 = yield takeEvery('MAPVIEW_SHOW_MY_LOCATION_START', showMyLocation, mapView);
      yield take('MAPVIEW_UNLOAD');
      yield cancel(task1, task2, task3, task4);
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_MAINSAGA_ERROR', payload: error });
  }
}

function* animateToBearing(mapView, action) {
  try {
    const { duration, bearingAngle } = action.payload;
    const animationDuration = duration || defaultAnimationDuration;
    yield call(mapView.animateToBearing, bearingAngle, animationDuration);
  } catch (error) {
    yield put({ type: 'MAPVIEW_ANIMATE_TO_BEARING_ERROR', payload: error });
  }
}

function* animateToRegion(mapView, action) {
  try {
    const { region, duration } = action.payload;
    const animationDuration = duration || defaultAnimationDuration;
    yield call(mapView.animateToRegion, region, animationDuration);
  } catch (error) {
    yield put({ type: 'MAPVIEW_ANIMATE_TO_REGION_ERROR', payload: error });
  }
}

function* animateToCoordinate(mapView, action) {
  try {
    const { coords, duration } = action.payload;
    const animationDuration = duration || defaultAnimationDuration;
    yield call(mapView.animateToCoordinate, coords, animationDuration);
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_FINISH' });
  } catch (error) {
    yield put({ type: 'MAPVIEW_ANIMATE_TO_COORDINATE_ERROR', payload: error });
  }
}

function* showMyLocation(mapView, action) {
  try {
    const { coords, duration } = action.payload;
    const animationDuration = duration || defaultAnimationDuration;
    yield call(mapView.animateToCoordinate, coords, animationDuration);
    yield call(delay, animationDuration);

    yield put({
      type: 'MAPVIEW_ANIMATE_TO_REGION',
      payload: {
        region: {
          latitude: coords.latitude,
          longitude: coords.longitude,
          latitudeDelta: 0.00322,
          longitudeDelta: 0.00322,
        },
        duration: animationDuration,
      },
    });

    yield call(delay, animationDuration);
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_FINISH' });
  } catch (error) {
    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_ERROR', payload: error });
  }
}
