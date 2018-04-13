import { combineReducers } from 'redux';

import * as usersAroundRedux from './users-around-reducer';
import authReducer from './auth-reducer';
import locationReducer from './location-reducer';
import mapViewReducer from './mapview-reducer';
import mapDirectionsReducer from './map-directions-reducer';
import compassReducer from './compass-reducer';
import mapPanelReducer from './map-panel-reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  usersAround: usersAroundRedux.reducer,
  mapView: mapViewReducer,
  compass: compassReducer,
  mapPanel: mapPanelReducer,
  mapDirections: mapDirectionsReducer,
});

export const { usersAroundActionCreators } = usersAroundRedux;
