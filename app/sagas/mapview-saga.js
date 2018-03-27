import { throttle, takeEvery } from 'redux-saga/effects';

const animateToRegionDuration = 500;

export default function* mapViewSaga() {
  yield throttle(1000, 'MAPVIEW_ROTATE', rotate);
  yield takeEvery('MAPVIEW_ANIMATE_TO_REGION', animateToRegion);
}

function* rotate(action) {
  const { mapView, rotationAngle } = action.payload;
  yield mapView.animateToBearing(rotationAngle);
}

function* animateToRegion(action) {
  const { mapView, region } = action.payload;
  yield mapView.animateToRegion(region, animateToRegionDuration);
}
