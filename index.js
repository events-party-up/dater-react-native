import { AppRegistry, Platform } from 'react-native';
import * as RNBackgroundGeolocation from 'react-native-background-geolocation';

import App from './app/index';
import BackgroundGeolocation from './app/services/background-geolocation';

AppRegistry.registerComponent('DaterReactNative', () => App);

if (Platform.OS === 'android') {
  const HeadlessTask = async (event) => {
    const { params } = event;
    // console.log('[BackgroundGeolocation HeadlessTask] -', event.name, params);

    switch (event.name) {
      case 'location': {
        console.log('[BackgroundGeolocation HeadlessTask] -', event.name, params);
        const { coords } = params;
        const { extras } = params;
        await BackgroundGeolocation.updateGeoPointInFirestore({
          uid: extras.uid,
          apiKey: extras.firebaseAuthToken,
          coords,
        });
        break;
      }
      default:
    }
  };

  // Register your HeadlessTask with BackgroundGeolocation plugin.
  RNBackgroundGeolocation.registerHeadlessTask(HeadlessTask);
}
