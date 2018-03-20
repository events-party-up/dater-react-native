import * as BackgroundGeolocation from 'react-native-background-geolocation';
import { geoActionCreators } from '../redux/index';

const GEO_OPTIONS = {
  useSignificantChanges: false,
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 1000,
  distanceFilter: 2,
  desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
  // Activity Recognition
  stopTimeout: 1,
  // Application config
  debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
  logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
  stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
  startOnBoot: true, // <-- Auto start tracking when device is powered-up.
  // HTTP / SQLite config
  batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
  autoSync: false, // <-- [Default: true] Set true to sync each location to server as it arrives.
};

export const watchGeoPosition = (dispatch): number => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      dispatch(geoActionCreators.geoUpdated(position.coords));
    },
    (error) => dispatch(geoActionCreators.geoDenied(error)),
    GEO_OPTIONS,
  );
  return watchId;
};

export const getGeoPosition = (dispatch) => {
  console.log('Getting geo position manually in getGeoPosition');
  BackgroundGeolocation.getCurrentPosition(
    (position) => {
      dispatch(geoActionCreators.geoUpdated(position.coords));
    },
    (error) => {
      console.error(error);
      dispatch(geoActionCreators.geoDenied(error));
    },
    {
      useSignificantChanges: false,
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 1000,
      distanceFilter: 2,
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    },
  );
};

export const initBackgroundGeolocation = (dispatch) => {
  BackgroundGeolocation.configure(GEO_OPTIONS, (state) => {
    console.log('- BackgroundGeolocation is configured and ready: ', state.enabled);
    console.log('HERE 1');

    if (state.enabled) {
      console.log('HERE');
      getGeoPosition(dispatch);
    } else {
      // 3. Start tracking!
      BackgroundGeolocation.start(() => {
        console.log('- Start success');
      });
    }
  });
};

