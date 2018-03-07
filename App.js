/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

 
import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View
} from 'react-native';


import DaterMapView from "./app/components/DaterMapView";

type Props = {};
export default class App extends Component<Props> {
  render() {
    return (
      <View style={styles.mainContainer}>
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
