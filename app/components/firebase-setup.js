import React, { Component } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import firebase from 'react-native-firebase';

export default class FirebaseSetup extends Component {
  render() {
    return (
      <View style={styles.modules}>
        <Text style={styles.modulesHeader}>The following Firebase modules are enabled:</Text>
        {firebase.admob.nativeModuleExists && <Text style={styles.module}>Admob</Text>}
        {firebase.analytics.nativeModuleExists && <Text style={styles.module}>Analytics</Text>}
        {firebase.auth.nativeModuleExists && <Text style={styles.module}>Authentication</Text>}
        {firebase.fabric.crashlytics.nativeModuleExists && <Text style={styles.module}>Crashlytics</Text>}
        {firebase.crash.nativeModuleExists && <Text style={styles.module}>Crash Reporting</Text>}
        {firebase.firestore.nativeModuleExists && <Text style={styles.module}>Cloud Firestore</Text>}
        {firebase.messaging.nativeModuleExists && <Text style={styles.module}>Messaging</Text>}
        {firebase.perf.nativeModuleExists && <Text style={styles.module}>Performance Monitoring</Text>}
        {firebase.database.nativeModuleExists && <Text style={styles.module}>Realtime Database</Text>}
        {firebase.config.nativeModuleExists && <Text style={styles.module}>Remote Config</Text>}
        {firebase.storage.nativeModuleExists && <Text style={styles.module}>Storage</Text>}
      </View>
    );
  }
}


const styles = StyleSheet.create({
  modules: {
    flex: 1,
    margin: 20,
  },
  modulesHeader: {
    fontSize: 16,
    marginBottom: 8,
  },
  module: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
});
