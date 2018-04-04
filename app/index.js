import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import firebase from 'react-native-firebase';

import configureStore from './config/configure-store';
import RootStack from './navigators';

const store = configureStore();
type Props = {
};

export default class App extends Component<Props> {
  componentDidMount() {
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
