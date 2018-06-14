/**
 * Saga to initialize the mapview region on app load
 */
import { take, put, select } from 'redux-saga/effects';

export default function* mapViewInitializeRegionSaga() {
  try {
    yield take('MAPVIEW_MAIN_SAGA_READY'); // make sure the main saga is ready

    const coords = yield select((state) => state.location.coords);
    if (!coords) {
      yield put({
        type: 'MAPVIEW_SET_CAMERA',
        payload: {
          heading: 0,
          zoom: 1,
          latitude: 55.751244,
          longitude: 37.618423,
          duration: 2000,
        },
      });
      yield take('GEO_LOCATION_UPDATED'); // get first geo update
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_INIT_REGION_ERROR', payload: error });
  }
}
