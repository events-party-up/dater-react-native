import BackgroundGeolocation from 'react-native-background-geolocation';
import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

import { GeoCoordinates } from '../types/index';
import { GEO_POINTS_COLLECTION } from '../constants';

const geoOptions = async () => {
  const { currentUser } = firebase.auth();
  const firebaseAuthToken = currentUser ? await currentUser.getIdToken() : null;
  const uid = currentUser ? currentUser.uid : 'unknown';

  return {
    reset: true,
    useSignificantChanges: false,
    enableHighAccuracy: true,
    distanceFilter: 5,
    // disableElasticity: true,
    desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
    // stopTimeout: 1,
    debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
    // disableStopDetection: process.env.NODE_ENV === 'development' || false, // disable stop detection in dev mode
    logLevel: BackgroundGeolocation.LOG_LEVEL_DEBUG,
    stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
    enableHeadless: true, // <-- Android Headless mode
    foregroundService: false, // <-- Android, enforced to true on Android 8
    preventSuspend: true, // iOS only
    disableLocationAuthorizationAlert: false,
    locationAuthorizationRequest: 'Any',
    locationAuthorizationAlert: {
      cancelButton: 'Отменить',
      instructions: 'Чтобы пользоваться приложением Dater, необходимо дать разрешение на определение вашего местоположения в настройках.', // eslint-disable-line
      settingsButton: 'Настройки',
      titleWhenNotEnabled: 'Геолокация не включена!',
      titleWhenOff: 'Нет доступа к вашей геолокации!',
    },
    // activityType: 'ACTIVITY_TYPE_OTHER_NAVIGATION',
    heartbeatInterval: 60,
    startOnBoot: true, // <-- Auto start tracking when device is powered-up.
    batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
    autoSync: true, // <-- [Default: true] Set true to sync each location to server as it arrives.
    // url: `https://dater-geolocation-console.herokuapp.com/locations/${uid}`,
    notificationPriority: BackgroundGeolocation.NOTIFICATION_PRIORITY_LOW,
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
  const patchUrl = `${fireStoreUrl}/${GEO_POINTS_COLLECTION}/${options.uid}?currentDocument.exists=true&` +
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

const DaterBackgroundGeolocation = {
  init: async () => {
    const GEO_OPTIONS = await geoOptions();
    const bgServiceState = await new Promise((resolve, reject) => {
      BackgroundGeolocation.ready(GEO_OPTIONS, (state) => {
        resolve(state);
      }, (error) => reject(error));
    });

    return bgServiceState;
  },
  start: () => (
    BackgroundGeolocation.start()
  ),
  stop: () => (
    BackgroundGeolocation.stop()
  ),
  changePace: (value: boolean) => (
    BackgroundGeolocation.changePace(value)
  ),
  getCurrentPosition: async () => {
    const GEO_OPTIONS = await geoOptions();
    return new Promise((resolve, reject) => {
      BackgroundGeolocation.getCurrentPosition(
        GEO_OPTIONS,
        (position) => resolve(position),
        (error) => reject(error),
      );
    });
  },
  updateGeoPointInFirestore,
};

export default DaterBackgroundGeolocation;
