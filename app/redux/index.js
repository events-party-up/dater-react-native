import { combineReducers } from 'redux';

import * as authRedux from './auth-redux';
import * as geoRedux from './location-redux';
import * as usersAroundRedux from './users-around-redux';
import * as mapViewRedux from './mapview-redux';
import compassReducer from './compass-redux';

export const reducer = combineReducers({
  auth: authRedux.reducer,
  geo: geoRedux.reducer,
  usersAround: usersAroundRedux.reducer,
  mapView: mapViewRedux.reducer,
  compass: compassReducer,
});

export const { authActionCreators } = authRedux;
export const { geoActionCreators } = geoRedux;
export const { usersAroundActionCreators } = usersAroundRedux;
export const { mapViewActionCreators } = mapViewRedux;
