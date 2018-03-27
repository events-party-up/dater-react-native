import { throttle } from 'redux-saga/effects';

export default function* mapViewSaga() {
  yield throttle(1000, 'MAPVIEW_ROTATE', rotateSaga);
}

function* rotateSaga(action) {
  const { mapView, rotationAngle } = action.payload;
  yield mapView.animateToBearing(rotationAngle);
}
