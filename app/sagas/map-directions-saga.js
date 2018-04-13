import { call, take, put, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import MapDirections from '../services/maps-directions';

export default function* mapDirectionsSaga() {
  try {
    while (true) {
      const action = yield take('MAPVIEW_BUILD_ROUTE_START');
      const routeToUser = action.payload;
      const toLocation = {
        latitude: routeToUser.geoPoint.latitude,
        longitude: routeToUser.geoPoint.longitude,
      };
      const myLocation = yield select((state) => state.location.coords);
      const route = yield call(MapDirections, myLocation, toLocation);
      yield put({ type: 'MAPVIEW_BUILD_ROUTE_FINISH', payload: route });
      yield delay(250);
      yield put({ type: 'UI_MAP_PANEL_HIDE_START' });
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_BUILD_ROUTE_ERROR', payload: error });
  }
}
