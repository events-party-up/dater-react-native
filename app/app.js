import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { AppNavigator } from './navigators/navigator-actions';
import configureStore from './config/configure-store';
import RootStack from './navigators/root-navigator';
import { MAP_BOX_ACCESS_TOKEN } from './constants';

const RootStackWithActions = AppNavigator(RootStack);

const store = configureStore();
type Props = {
};

MapboxGL.setAccessToken(MAP_BOX_ACCESS_TOKEN);

export default class App extends Component<Props> {
  componentDidMount() {
    SplashScreen.hide();
    firebase.analytics().logEvent('App_Started', {
      platform: Platform.OS,
    });
  }

  render() {
    return (
      <Provider store={store}>
        <RootStackWithActions />
      </Provider>
    );
  }
}
