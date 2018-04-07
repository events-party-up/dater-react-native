/**
 * Saga to initialize the mapview region on app load
 */
import { take, put, select } from 'redux-saga/effects';

export default function* mapViewInitializeRegionSaga() {
  try {
    const coords = yield select((state) => state.location.coords);
    if (coords) {
      const mapViewState = yield select((state) => state.mapView);
      yield put({
        type: 'MAPVIEW_ANIMATE_TO_REGION',
        payload: {
          region: {
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: mapViewState.latitudeDelta,
            longitudeDelta: mapViewState.longitudeDelta,
          },
          duration: 0,
        },
      });
    } else {
      const initialLocation = yield take('GEO_LOCATION_UPDATED'); // get first geo update
      yield animateToCurrentRegion(initialLocation); // zoom map to first location
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_INIT_REGION_ERROR', payload: error });
  }
}

function* animateToCurrentRegion(action) {
  const mapViewState = yield select((state) => state.mapView);
  yield put({
    type: 'MAPVIEW_ANIMATE_TO_REGION',
    payload: {
      region: {
        latitude: action.payload.latitude,
        longitude: action.payload.longitude,
        latitudeDelta: mapViewState.latitudeDelta,
        longitudeDelta: mapViewState.longitudeDelta,
      },
      duration: 0,
    },
  });
}
