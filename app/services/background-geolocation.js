import * as RNBackgroundGeolocation from 'react-native-background-geolocation';
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

import { geoActionCreators } from '../redux/index';
import { GeoCoordinates } from '../types/index';

const geoOptions = async () => {
  const { currentUser } = firebase.auth();
  const firebaseAuthToken = currentUser ? await currentUser.getIdToken() : null;
  const uid = currentUser ? currentUser.uid : 'unknown';

  return {
    useSignificantChanges: false,
    enableHighAccuracy: true,
    maximumAge: 1000,
    distanceFilter: 2,
    desiredAccuracy: RNBackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    stopTimeout: 1,
    debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
    logLevel: RNBackgroundGeolocation.LOG_LEVEL_VERBOSE,
    stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
    enableHeadless: true, // <-- Android Headless mode
    foregroundService: false, // <-- Android, enforced to true on Android 8
    startOnBoot: true, // <-- Auto start tracking when device is powered-up.
    batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
    autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
    url: `https://dater-geolocation-console.herokuapp.com/locations/${uid}`,
    notificationPriority: RNBackgroundGeolocation.NOTIFICATION_PRIORITY_LOW,
    notificationTitle: 'Dater.com',
    notificationText: 'Dater Mode ON',
    params: {
      device: {
        platform: Platform.OS,
        version: DeviceInfo.getSystemVersion(),
        uuid: DeviceInfo.getUniqueID(),
        model: DeviceInfo.getModel(),
        manufacturer: DeviceInfo.getManufacturer(),
      },
    },
    extras: {
      uid,
      firebaseAuthToken,
    },
  };
};


const updateGeoPointInFirestore = (options: {
  uid: string,
  apiKey: string,
  coords: GeoCoordinates,
}) => {
  const fireStoreUrl = 'https://firestore.googleapis.com/v1beta1/projects/dater3-dev/databases/(default)/documents';
  const patchUrl = `${fireStoreUrl}/geoPoints/${options.uid}?currentDocument.exists=true&` +
    'updateMask.fieldPaths=geoPoint&' +
    'updateMask.fieldPaths=speed&' +
    'updateMask.fieldPaths=accuracy&' +
    'updateMask.fieldPaths=heading&' +
    `key=${options.apiKey}`;

  return fetch(patchUrl, {
    method: 'PATCH',
    body: JSON.stringify({
      fields: {
        geoPoint: {
          geoPointValue: {
            latitude: options.coords.latitude,
            longitude: options.coords.longitude,
          },
        },
        speed: {
          doubleValue: options.coords.speed,
        },
        accuracy: {
          doubleValue: options.coords.accuracy,
        },
        heading: {
          doubleValue: options.coords.heading,
        },
      },
    }),
  })
    .then((response) => {
      if (response.status !== 200) {
        console.error('Error while patching firestore in updateGeoPointInFirestore: ', response);
      }
    })
    .catch((err) => console.error(err));
};

const toggleBgServices = (dispatch) => {
  RNBackgroundGeolocation.getState((state) => {
    if (state.enabled) {
      RNBackgroundGeolocation.stop(() => (dispatch(geoActionCreators.stopBgServices())));
    } else {
      RNBackgroundGeolocation.start(() => (dispatch(geoActionCreators.startBgServices())));
    }
  });
};

const BackgroundGeolocation = {
  init: async (dispatch) => {
    const GEO_OPTIONS = await geoOptions();
    // This handler fires whenever bgGeo receives a location update.
    RNBackgroundGeolocation.on('location', onLocation, onError);

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    // RNBackgroundGeolocation.on('motionchange', onMotionChange);

    // This event fires when a change in motion activity is detected
    // RNBackgroundGeolocation.on('activitychange', onActivityChange);

    // This event fires when the user toggles location-services authorization
    RNBackgroundGeolocation.on('providerchange', onProviderChange);

    RNBackgroundGeolocation.configure(GEO_OPTIONS, (state) => {
      console.log('- BackgroundGeolocation is configured and ready: ', state.enabled);
      if (state.enabled) {
        dispatch(geoActionCreators.startBgServices());
        // manually activate tracking (for js reloads in simulator or hot pushes)
        RNBackgroundGeolocation.changePace(true);
      } else {
        // 3. Start tracking!
        RNBackgroundGeolocation.start(() => {
          // console.log('- Start success');
          dispatch(geoActionCreators.startBgServices());
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
  },
  getCurrentPosition: async (dispatch) => {
    console.log('Getting geo position manually in getGeoPosition');
    const GEO_OPTIONS = await geoOptions();
    RNBackgroundGeolocation.getCurrentPosition(
      GEO_OPTIONS,
      (position) => {
        dispatch(geoActionCreators.geoUpdated(position.coords));
      },
      (error) => {
        console.error(error);
        dispatch(geoActionCreators.geoDenied(error));
      },
    );
  },
  updateGeoPointInFirestore,
  toggleBgServices,
};

export default BackgroundGeolocation;
