import { throttle, takeEvery, call, take } from 'redux-saga/effects';
import GeoUtils from '../utils';

const defaultAnimationDuration = 500;

export default function* mapViewSaga() {
  yield throttle(1000, 'MAPVIEW_ROTATE', rotate);
  yield takeEvery('MAPVIEW_ANIMATE_TO_REGION', animateToRegion);
  yield takeEvery('MAPVIEW_ANIMATE_TO_COORDINATE', animateToCoordinate);
  const { mapView } = yield take('MAPVIEW_READY');
  yield throttle(1000, 'GEO_COMPASS_HEADING_UPDATE', rotateMapViewSaga, mapView);
}

function* rotateMapViewSaga(mapView, action) {
  const rotationAngle = GeoUtils.wrapCompassHeading(action.payload);
  const { duration } = action.payload;
  const animationDuration = duration || defaultAnimationDuration;
  yield call(mapView.animateToBearing, rotationAngle, animationDuration);
}

function* rotate(action) {
  const { rotationAngle, duration } = action.payload;
  const { mapView } = action;
  const animationDuration = duration || defaultAnimationDuration;
  yield call(mapView.animateToBearing, rotationAngle, animationDuration);
}

function* animateToRegion(action) {
  const { mapView, region, duration } = action.payload;
  const animationDuration = duration || defaultAnimationDuration;
  yield call(mapView.animateToRegion, region, animationDuration);
}

function* animateToCoordinate(action) {
  const { mapView, coords, duration } = action.payload;
  const animationDuration = duration || defaultAnimationDuration;
  yield call(mapView.animateToCoordinate, coords, animationDuration);
}
