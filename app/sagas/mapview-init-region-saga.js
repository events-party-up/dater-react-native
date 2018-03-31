/**
 * Saga to initialize the mapview region on app load
 */
import { take, put, select } from 'redux-saga/effects';

export default function* mapViewInitializeRegionSaga(action) {
  try {
    const { mapView } = action;
    const initialLocation = yield take('GEO_LOCATION_UPDATED'); // get first geo update
    yield animateToCurrentRegion(mapView, initialLocation); // zoom map to first location
  } catch (error) {
    yield put({ type: 'MAPVIEW_INIT_REGION_ERROR', payload: error });
  }
}

function* animateToCurrentRegion(mapView, action) {
  const mapViewState = yield select((state) => state.mapView);
  yield put({
    type: 'MAPVIEW_ANIMATE_TO_REGION',
    payload: {
      mapView,
      region: {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        latitudeDelta: mapViewState.latitudeDelta,
        longitudeDelta: mapViewState.longitudeDelta,
      },
    },
    duration: 0,
  });
}
