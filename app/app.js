import React, { Component } from 'react';
import { Platform } from 'react-native';
import { Provider } from 'react-redux';
import firebase from 'react-native-firebase';
import SplashScreen from 'react-native-splash-screen';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
// import type { RemoteMessage, Notification } from 'react-native-firebase';

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
  messageListener;
  notificationListener;

  async componentDidMount() {
    // await firebase.messaging().requestPermission();
    // const fcmToken = await firebase.messaging().getToken();
    // console.log('fcmToken: ', fcmToken);

    SplashScreen.hide();
    firebase.analytics().logEvent('App_Started', {
      platform: Platform.OS,
    });

    // this.messageListener = firebase.messaging().onMessage((message: RemoteMessage) => {
    //   console.log('New Push message: ', message);
    // });
    // this.notificationListener = firebase.notifications().onNotification((notification: Notification) => {
    //   console.log('New Push notification: ', notification);
    // });
  }

  componentWillUnmount() {
    this.messageListener();
    this.notificationListener();
  }

  render() {
    return (
      <Provider store={store}>
        <RootStackWithActions />
      </Provider>
    );
  }
}
