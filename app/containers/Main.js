import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux'
import firebase from 'react-native-firebase';

import { DaterMapView, FirebaseSetup } from "../components";

type Props = {};
class Main extends Component<Props> {

  render() {
    return (
      <View style={styles.mainContainer}>
        {/* <FirebaseSetup /> */}
        <DaterMapView />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: 'gray',
    opacity: 1,
    alignSelf: 'stretch',
    flex: 1,
  },
});

export default connect()(Main)