import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import firebase from 'react-native-firebase';
import { StackNavigator } from 'react-navigation';

import configureStore from './config/configure-store';
import Main from './containers';

const store = configureStore();
type Props = {
};

class MainScreen extends Component<Props> {
  render() {
    return (
      <Main />
    );
  }
}

const RootStack = StackNavigator({
  Home: {
    screen: MainScreen,
  },
});


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
