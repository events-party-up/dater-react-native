import React, { Component } from 'react';
import { AppRegistry, Platform } from 'react-native';
import * as RNBackgroundGeolocation from 'react-native-background-geolocation';
import { Provider } from 'react-redux';

import BackgroundGeolocation from './app/services/background-geolocation';
import configureStore from './app/config/configure-store';
import RootStack from './app/navigators';

const store = configureStore();

type Props = {
};

class DaterApp extends Component<Props> {
  render() {
    return (
      <Provider store={store}>
        <RootStack />
      </Provider>
    );
  }
}

AppRegistry.registerComponent('DaterReactNative', () => DaterApp);

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
