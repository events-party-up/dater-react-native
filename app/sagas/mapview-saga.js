import { throttle, takeEvery, call, take } from 'redux-saga/effects';
import GeoUtils from '../utils';

const defaultAnimationDuration = 500;

export default function* mapViewSaga() {
  yield throttle(1000, 'MAPVIEW_ROTATE', rotate);
  yield takeEvery('MAPVIEW_ANIMATE_TO_REGION', animateToRegion);
  const { mapView } = yield take('MAPVIEW_READY');
  yield throttle(500, 'GEO_COMPASS_HEADING_UPDATE', rotateMapViewSaga, mapView);
}

// GeoUtils.wrapCompassHeading(heading)

function* rotateMapViewSaga(mapView, action) {
  const rotationAngle = GeoUtils.wrapCompassHeading(action.payload);
  console.log('rotationAngle: ', rotationAngle);
  yield call(mapView.animateToBearing, rotationAngle);
}

function* rotate(action) {
  const { mapView, rotationAngle } = action.payload;
  yield call(mapView.animateToBearing, rotationAngle);
}

function* animateToRegion(action) {
  const { mapView, region, duration } = action.payload;
  const animationDuration = duration || defaultAnimationDuration;
  yield call(mapView.animateToRegion, region, animationDuration);
}
