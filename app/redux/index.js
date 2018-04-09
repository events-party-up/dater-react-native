import { combineReducers } from 'redux';

import * as usersAroundRedux from './users-around-redux';
import authReducer from './auth-redux';
import locationReducer from './location-redux';
import mapViewReducer from './mapview-redux';
import compassReducer from './compass-redux';

// const reducer = combineReducers({
//   auth: authReducer,
//   location: locationReducer,
//   usersAround: usersAroundRedux.reducer,
//   mapView: mapViewReducer,
//   compass: compassReducer,
// });

// // module.exports = reducer;

// module.exports = {
//   auth: authReducer,
//   location: locationReducer,
//   usersAround: usersAroundRedux.reducer,
//   mapView: mapViewReducer,
//   compass: compassReducer,
// };

export default combineReducers({
  auth: authReducer,
  location: locationReducer,
  usersAround: usersAroundRedux.reducer,
  mapView: mapViewReducer,
  compass: compassReducer,
});

