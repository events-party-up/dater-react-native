import { combineReducers } from 'redux';

import * as authRedux from './auth-redux';
import locationReducer from './location-redux';
import * as usersAroundRedux from './users-around-redux';
import MapViewReducer from './mapview-redux';
import compassReducer from './compass-redux';

export const reducer = combineReducers({
  auth: authRedux.reducer,
  geo: locationReducer,
  usersAround: usersAroundRedux.reducer,
  mapView: MapViewReducer,
  compass: compassReducer,
});

export const { authActionCreators } = authRedux;
export const { usersAroundActionCreators } = usersAroundRedux;
