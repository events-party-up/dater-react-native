import { combineReducers } from 'redux';

import usersAroundReducer from './users-around/users-around-reducer';
import authReducer from '../redux/auth/auth-reducer';
import locationReducer from './location/location-reducer';
import mapViewReducer from './map-view/map-view-reducer';
import compassReducer from './compass/compass-reducer';
import mapPanelReducer from './map-panel/map-panel-reducer';
import microDateReducer from './micro-date/micro-date-reducer';
import appStateReducer from './app-state/app-state-reducer';
import uploadPhotosReducer from './upload-photos/upload-photos-reducer';
import currentUserReducer from './current-user/current-user-reducer';
import permissionsReducer from './permissions/permissions-reducer';
import systemNotificatinosReducer from './system-notifications/system-notifications-reducer';

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
  systemNotifications: systemNotificatinosReducer,
});

export default rootReducer;
