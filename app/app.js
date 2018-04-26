import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import configureStore from './config/configure-store';
import RootStack from './navigators/root-navigator';

const store = configureStore();
type Props = {
};

MapboxGL.setAccessToken('pk.eyJ1Ijoib2xlZ3duIiwiYSI6ImNqZzZhZXRsaTFydjAzM21vZjR0Y290aG8ifQ.gsFXXecyedS9_eg8TGTu7A');

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
        <RootStack />
      </Provider>
    );
  }
}
