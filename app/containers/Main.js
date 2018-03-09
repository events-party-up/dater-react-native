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
import { signInAnonymously } from "../services/auth";
import { authActionCreators } from '../redux'

const mapStateToProps = (state) => ({
  auth: state.auth
})



type Props = {};
class Main extends Component<Props> {

  componentWillMount() {
    signInAnonymously()
      .then(response => this.props.dispatch(authActionCreators.authSuccess(response)))
      .catch(error => this.props.dispatch(authActionCreators.authError(error)));
  }

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

export default connect(mapStateToProps)(Main)