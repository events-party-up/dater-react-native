import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';

import configureStore from './config/configure-store';
import RootStack from './navigators/root-navigator';

const store = configureStore();
type Props = {
};

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
