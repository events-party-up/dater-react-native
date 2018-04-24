import { call, take, put, select } from 'redux-saga/effects';
import { delay } from 'redux-saga';

import MapDirections from '../services/maps-directions';
import { getFirestore } from '../utils/firebase-utils';

export default function* mapDirectionsSaga() {
  try {
    while (true) {
      const action = yield take('MAPVIEW_BUILD_ROUTE_START');
      const routeToUserUid = action.payload;
      const routeToUser = yield call(getFirestore, {
        collection: 'geoPoints',
        doc: routeToUserUid,
      });
      const toLocation = {
        latitude: routeToUser.geoPoint.latitude,
        longitude: routeToUser.geoPoint.longitude,
      };
      const myLocation = yield select((state) => state.location.coords);
      const route = yield call(MapDirections, myLocation, toLocation);
      yield put({ type: 'MAPVIEW_BUILD_ROUTE_FINISH', payload: route });
      yield delay(250);

      yield put({
        type: 'UI_MAP_PANEL_REPLACE_START',
        payload: {
          mode: 'routeInfo',
          data: {
            route,
            routeToUser,
          },
        },
      });
    }
  } catch (error) {
    yield put({ type: 'MAPVIEW_BUILD_ROUTE_ERROR', payload: error });
  }
}
