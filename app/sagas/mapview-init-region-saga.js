/**
 * Saga to initialize the mapview region on app load
 */
import { take, put, select } from 'redux-saga/effects';

export default function* mapViewInitializeRegionSaga() {
  try {
    const coords = yield select((state) => state.location.coords);
    if (coords) {
      yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_START' });
    } else { // if we don't yet have user coords in the store!
      yield take('GEO_LOCATION_UPDATED'); // get first geo update
      yield put({ type: 'MAPVIEW_SHOW_MY_LOCATION_START' });
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_INIT_REGION_ERROR', payload: error });
  }
}
