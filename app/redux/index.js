import { combineReducers } from 'redux';

import * as usersAroundRedux from './users-around-redux';
import authReducer from './auth-redux';
import locationReducer from './location-redux';
import mapViewReducer from './mapview-redux';
import compassReducer from './compass-redux';

export const reducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  usersAround: usersAroundRedux.reducer,
  mapView: mapViewReducer,
  compass: compassReducer,
});

export const { usersAroundActionCreators } = usersAroundRedux;
