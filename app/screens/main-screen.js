import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect, Dispatch } from 'react-redux';
import { type NavigationScreenProp, type NavigationStateRoute } from 'react-navigation';

import { DaterMapView } from '../components';
import listenForUsersAround from '../services/geo-query';
import { GeoCoordinates, GeoCompass } from '../types';
import DaterButton from '../components/ui-kit/dater-button';
import MyLocationButton from '../components/map/my-location-button';
import MapPanel from '../components/map/map-panel';

const mapStateToProps = (state) => ({
  auth: state.auth,
  location: state.location,
  compass: state.compass,
});

type Props = {
  dispatch: Dispatch,
  location: {
    coords: GeoCoordinates,
  },
  navigation: NavigationScreenProp<NavigationStateRoute>,
  compass: GeoCompass,
};

class MainScreen extends Component<Props> {
  unsubscribeFromUsersAround;

  componentWillUnmount() {
    this.unsubscribeFromUsersAround();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.location.coords && !this.unsubscribeFromUsersAround) {
      const queryArea = {
        center: {
          latitude: nextProps.location.coords.latitude,
          longitude: nextProps.location.coords.longitude,
        },
        radius: 25,
      };
      console.log('Attach a listener for users around');
      this.unsubscribeFromUsersAround = listenForUsersAround(queryArea, this.props.dispatch);
    }
  }

  signOut = async () => {
    this.props.dispatch({
      type: 'AUTH_SIGNOUT',
    });
  }

  render() {
    return (
      <View style={styles.mainContainer}>
        {/* <FirebaseSetup /> */}
        {/* <View style={styles.button}>
          <Button title="Выйти" color="blue" onPress={this.signOut} />
        </View> */}
        <MapPanel />
        <DaterMapView />
        <MyLocationButton
          location={this.props.location}
          compass={this.props.compass}
        />

        {/* <View style={styles.loginButton}>
          <Button title="Вход" color="blue" onPress={() => this.props.navigation.navigate('Login')} />
        </View> */}
        {/* <View style={styles.button1}>
          <Button title="Typography" color="blue" onPress={() => this.props.navigation.navigate('Typography')} />
        </View>
        <View style={styles.button2}>
          <Button title="Buttons" color="blue" onPress={() => this.props.navigation.navigate('Buttons')} />
        </View> */}
        <DaterButton style={styles.button1} onPress={() => this.props.navigation.navigate('UIKit')}>
          UI Kit
        </DaterButton>
        <DaterButton style={styles.button2} onPress={() => this.props.navigation.navigate('Login')} type="secondary">
          Login
        </DaterButton>
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
  button1: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button2: {
    position: 'absolute',
    bottom: 90,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  loginButton: {
    position: 'absolute',
    zIndex: 2,
    right: 20,
    top: 20,
  },
  debugText: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    zIndex: 2,
    opacity: 0.8,
  },
});

export default connect(mapStateToProps)(MainScreen);
