import * as RNBackgroundGeolocation from 'react-native-background-geolocation';
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';
import { geoActionCreators } from '../redux/index';

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
    debug: false, // <-- enable this hear sounds for background-geolocation life-cycle.
    logLevel: RNBackgroundGeolocation.LOG_LEVEL_VERBOSE,
    stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
    enableHeadless: true, // <-- Android Headless mode
    startOnBoot: true, // <-- Auto start tracking when device is powered-up.
    batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
    autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
    url: `https://dater-geolocation-console.herokuapp.com/locations/${uid}`,
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


const updateGeoPointInFirestore = (uid, apiKey, coords) => {
  const fireStoreUrl = 'https://firestore.googleapis.com/v1beta1/projects/dater3-dev/databases/(default)/documents';
  const patchUrl = `${fireStoreUrl}/geoPoints/${uid}?currentDocument.exists=true&` +
    'updateMask.fieldPaths=geoPoint&' +
    'updateMask.fieldPaths=speed&' +
    'updateMask.fieldPaths=accuracy&' +
    'updateMask.fieldPaths=heading&' +
    `key=${apiKey}`;

  return fetch(patchUrl, {
    method: 'PATCH',
    body: JSON.stringify({
      fields: {
        geoPoint: {
          geoPointValue: {
            latitude: coords.latitude,
            longitude: coords.longitude,
          },
        },
        speed: {
          doubleValue: coords.speed,
        },
        accuracy: {
          doubleValue: coords.accuracy,
        },
        heading: {
          doubleValue: coords.heading,
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

const BackgroundGeolocation = {
  init: async (dispatch) => {
    const GEO_OPTIONS = await geoOptions();
    console.log('Geo Options: ', GEO_OPTIONS);
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
        // manually activate tracking (for js reloads in simulator or hot pushes)
        RNBackgroundGeolocation.changePace(true);
      } else {
        // 3. Start tracking!
        RNBackgroundGeolocation.start(() => {
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
  },
  getCurrentPosition: async (dispatch) => {
    console.log('Getting geo position manually in getGeoPosition');
    const GEO_OPTIONS = await geoOptions();
    RNBackgroundGeolocation.getCurrentPosition(
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
  },
  updateGeoPointInFirestore,
};

export default BackgroundGeolocation;
