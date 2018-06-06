/**
 * Saga to initialize the mapview region on app load
 */
import { take, put, select } from 'redux-saga/effects';

export default function* mapViewInitializeRegionSaga() {
  try {
    yield take('MAPVIEW_MAIN_SAGA_READY'); // make sure the main saga is ready

    const coords = yield select((state) => state.location.coords);
    if (!coords) {
      yield take('GEO_LOCATION_UPDATED'); // get first geo update
    }

    const locationServicesEnabled = yield select((state) => state.location.enabled);
    if (!locationServicesEnabled) {
      yield take('GEO_LOCATION_STARTED'); // wait for services to start
    }

    yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_START', payload: { caller: 'mapViewInitializeRegionSaga' } });
  } catch (error) {
    yield put({ type: 'MAPVIEW_INIT_REGION_ERROR', payload: error });
  }
}
