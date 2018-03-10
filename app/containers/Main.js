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
  auth: state.auth
})

class Main extends Component {
  authUnsubscribe;
  
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
        <View style={styles.button}>
          <Button title='Выйти' color='blue' onPress={this.signOut}/>
        </View>
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
  }
});

export default connect(mapStateToProps)(Main)