import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import * as BackgroundGeolocation from 'react-native-background-geolocation';

import { DaterMapView } from '../components';
import { initUserAuth, signOutUser } from '../services/auth';
import { initBackgroundGeolocation } from '../services/geoDevice';
import { listenForUsersAround } from '../services/geoQuery';

const mapStateToProps = (state) => ({
  auth: state.auth,
  coords: state.geo.coords,
});

type Props = {
  dispatch: any,
};

class Main extends Component<Props> {
  authUnsubscribe;
  unsubscribeFromUsersAround;

  async componentWillMount() {
    this.authUnsubscribe = initUserAuth(this.props.dispatch);
    initBackgroundGeolocation(this.props.dispatch);
  }

  componentWillUnmount() {
    BackgroundGeolocation.removeListeners();
    this.unsubscribeFromUsersAround();
    this.authUnsubscribe();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.coords && !this.unsubscribeFromUsersAround) {
      const queryArea = {
        center: {
          latitude: nextProps.coords.latitude,
          longitude: nextProps.coords.longitude,
        },
        radius: 25,
      };
      console.log('Attach a listener for users around');
      this.unsubscribeFromUsersAround = listenForUsersAround(queryArea, this.props.dispatch);
    }
  }

  signOut = async () => {
    this.authUnsubscribe();
    await signOutUser(this.props.dispatch);
  }

  render() {
    return (this.props.coords &&
      <View style={styles.mainContainer}>
        {/* <FirebaseSetup /> */}
        {/* <View style={styles.button}>
          <Button title='Выйти' color='blue' onPress={this.signOut}/>
        </View> */}
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
    left: 20,
    zIndex: 2,
    opacity: 0.8,
  },
});

export default connect(mapStateToProps)(Main);
