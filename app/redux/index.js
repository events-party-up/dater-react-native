import { combineReducers } from 'redux';

import * as authRedux from './auth-redux';
import * as usersAroundRedux from './users-around-redux';
import locationReducer from './location-redux';
import mapViewReducer from './mapview-redux';
import compassReducer from './compass-redux';

export const reducer = combineReducers({
  auth: authRedux.reducer,
  location: locationReducer,
  usersAround: usersAroundRedux.reducer,
  mapView: mapViewReducer,
  compass: compassReducer,
});

export const { authActionCreators } = authRedux;
export const { usersAroundActionCreators } = usersAroundRedux;
