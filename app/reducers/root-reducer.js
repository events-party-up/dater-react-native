import { combineReducers } from 'redux';

import usersAroundReducer from './users-around-reducer';
import authReducer from './auth-reducer';
import locationReducer from './location-reducer';
import mapViewReducer from './mapview-reducer';
import compassReducer from './compass-reducer';
import mapPanelReducer from './map-panel-reducer';
import microDateReducer from './micro-date-reducer';
import appStateReducer from './app-state-reducer';
import uploadPhotosReducer from './upload-photos-reducer';
import currentUserReducer from './current-user-reducer';
import permissionsReducer from './permissions-reducer';

export const rootReducer = combineReducers({
  auth: authReducer,
  location: locationReducer,
  usersAround: usersAroundReducer,
  mapView: mapViewReducer,
  compass: compassReducer,
  mapPanel: mapPanelReducer,
  microDate: microDateReducer,
  appState: appStateReducer,
  uploadPhotos: uploadPhotosReducer,
  currentUser: currentUserReducer,
  permissions: permissionsReducer,
});

export default rootReducer;
