import * as BackgroundGeolocation from 'react-native-background-geolocation';
import { geoActionCreators } from '../redux/index';

const GEO_OPTIONS = {
  useSignificantChanges: false,
  enableHighAccuracy: true,
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

export const getGeoPosition = (dispatch) => {
  console.log('Getting geo position manually in getGeoPosition');
  BackgroundGeolocation.getCurrentPosition(
    GEO_OPTIONS,
    (position) => {
      console.log('Response in callback: ');
      dispatch(geoActionCreators.geoUpdated(position.coords));
    },
    (error) => {
      console.error(error);
      dispatch(geoActionCreators.geoDenied(error));
    },
  );
};

export const initBackgroundGeolocation = (dispatch) => {
  // This handler fires whenever bgGeo receives a location update.
  BackgroundGeolocation.on('location', onLocation, onError);

  // This handler fires when movement states changes (stationary->moving; moving->stationary)
  // BackgroundGeolocation.on('motionchange', onMotionChange);

  // This event fires when a change in motion activity is detected
  // BackgroundGeolocation.on('activitychange', onActivityChange);

  // This event fires when the user toggles location-services authorization
  BackgroundGeolocation.on('providerchange', onProviderChange);

  BackgroundGeolocation.configure(GEO_OPTIONS, (state) => {
    console.log('- BackgroundGeolocation is configured and ready: ', state.enabled);
    if (state.enabled) {
      // manually activate tracking (for js reloads in simulator or hot pushes)
      BackgroundGeolocation.changePace(true);
    } else {
      // 3. Start tracking!
      BackgroundGeolocation.start(() => {
        console.log('- Start success');
      });
    }
  });

  function onLocation(location) {
    console.log('- [event] location: ', location);
    dispatch(geoActionCreators.geoUpdated(location.coords));
  }

  function onError(error) {
    console.warn('- [event] location error ', error);
  }


  function onProviderChange(provider) {
    console.log('- [event] providerchange: ', provider);
  }

  // function onActivityChange(activity) {
  //   console.log('- [event] activitychange: ', activity); // eg: 'on_foot', 'still', 'in_vehicle'
  // }

  // function onMotionChange(location) {
  //   console.log('- [event] motionchange: ', location.isMoving, location);
  // }
};

