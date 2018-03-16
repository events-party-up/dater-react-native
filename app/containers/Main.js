import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
  Button
} from 'react-native';
import { connect } from 'react-redux'
import firebase from 'react-native-firebase';

import { DaterMapView, FirebaseSetup } from "../components";
import { initUserAuth, signOutUser } from "../services/auth";
import { authActionCreators } from '../redux'

const mapStateToProps = (state) => ({
  auth: state.auth,
  coords: state.geo.coords,
})

class Main extends Component {
  constructor(props) {
    super(props);
    this.authUnsubscribe = initUserAuth(this.props.dispatch);
  }

  componentWillMount() {
  }

  componentWillUnmount() {
    this.authUnsubscribe();
  }

  signOut = async () =>  {
    this.authUnsubscribe();
    await signOutUser(this.props.dispatch);
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {/* <FirebaseSetup /> */}
        {/* <View style={styles.button}>
          <Button title='Выйти' color='blue' onPress={this.signOut}/>
        </View> */}
        <Text style={styles.debugText}>Accuracy: {this.props.coords.accuracy}{'\n'}
          Latitude: {this.props.coords.latitude}{'\n'}
          Longitude: {this.props.coords.longitude}{'\n'}
        </Text>
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
  button: {
    position: 'absolute',
    zIndex: 2,
    bottom: 50,
    left: 0,
    right: 0,
  },
  debugText: {
    position: 'absolute',
    bottom: 0,
    right: 20,
    zIndex: 2,
    opacity: 0.8
  }
});

export default connect(mapStateToProps)(Main)