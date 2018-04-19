import { combineReducers } from 'redux';

import usersAroundReducer from './users-around-reducer';
import authReducer from './auth-reducer';
import locationReducer from './location-reducer';
import mapViewReducer from './mapview-reducer';
import mapDirectionsReducer from './map-directions-reducer';
import compassReducer from './compass-reducer';
import mapPanelReducer from './map-panel-reducer';
import findUserReducer from './find-user-reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  usersAround: usersAroundReducer,
  mapView: mapViewReducer,
  compass: compassReducer,
  mapPanel: mapPanelReducer,
  mapDirections: mapDirectionsReducer,
  findUser: findUserReducer,
});

export default rootReducer;
