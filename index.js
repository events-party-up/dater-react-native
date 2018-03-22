import { AppRegistry, Platform } from 'react-native';
import * as RNBackgroundGeolocation from 'react-native-background-geolocation';

import App from './app/index';
import BackgroundGeolocation from './app/services/BackgroundGeolocation';

AppRegistry.registerComponent('DaterReactNative', () => App);

if (Platform.OS === 'android') {
  const HeadlessTask = async (event) => {
    const { params } = event;
    console.log('[BackgroundGeolocation HeadlessTask] -', event.name, params);

    switch (event.name) {
      case 'location': {
        const { coords } = params;
        const { extras } = params;

        await BackgroundGeolocation.updateGeoPointInFirestore(extras.uid, extras.firebaseAuthToken, coords);
        // console.log('Authorizing in firebase');
        // const uid = await getAuthStatus();
        // console.log('Updating firestore');
        // await firebase.firestore().collection('geoPoints').doc(uid).update({
        //   accuracy: coords.accuracy,
        //   heading: coords.heading,
        //   speed: coords.speed,
        //   geoPoint: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
        //   timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        // });
        break;
      }
      default:
    }
  };

  // Register your HeadlessTask with BackgroundGeolocation plugin.
  RNBackgroundGeolocation.registerHeadlessTask(HeadlessTask);
}
