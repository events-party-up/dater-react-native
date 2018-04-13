import { combineReducers } from 'redux';

import * as usersAroundRedux from './users-around-redux';
import authReducer from './auth-redux';
import locationReducer from './location-redux';
import mapViewReducer from './mapview-redux';
import mapDirectionsReducer from './map-directions-reducer';
import compassReducer from './compass-redux';
import mapPanelReducer from './map-panel-reducer';

export const reducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  usersAround: usersAroundRedux.reducer,
  mapView: mapViewReducer,
  compass: compassReducer,
  mapPanel: mapPanelReducer,
  mapDirections: mapDirectionsReducer,
});

export const { usersAroundActionCreators } = usersAroundRedux;
