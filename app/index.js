import React, { Component } from 'react';
import {
  Platform,
} from 'react-native';
import firebase from 'react-native-firebase';

import { Main } from "./containers";

export default class App extends Component {

  componentDidMount() {
    firebase.analytics().logEvent('App_Started', {
      platform: Platform.OS
    })
  }

  render() {
    return (
      <Main />
    );
  }
}
