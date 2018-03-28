import { throttle, takeEvery } from 'redux-saga/effects';

const defaultAnimationDuration = 500;

export default function* mapViewSaga() {
  yield throttle(1000, 'MAPVIEW_ROTATE', rotate);
  yield takeEvery('MAPVIEW_ANIMATE_TO_REGION', animateToRegion);
}

function* rotate(action) {
  const { mapView, rotationAngle } = action.payload;
  yield mapView.animateToBearing(rotationAngle);
}

function* animateToRegion(action) {
  const { mapView, region, duration } = action.payload;
  const animationDuration = duration || defaultAnimationDuration;
  yield mapView.animateToRegion(region, animationDuration);
}
