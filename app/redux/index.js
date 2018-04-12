import { combineReducers } from 'redux';

import * as usersAroundRedux from './users-around-redux';
import authReducer from './auth-redux';
import locationReducer from './location-redux';
import mapViewReducer from './mapview-redux';
import compassReducer from './compass-redux';
import uiReducer from './ui-reducer';

export const reducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  usersAround: usersAroundRedux.reducer,
  mapView: mapViewReducer,
  compass: compassReducer,
  ui: uiReducer,
});

export const { usersAroundActionCreators } = usersAroundRedux;
