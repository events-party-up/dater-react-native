import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect, Dispatch } from 'react-redux';

import DaterMapView from '../components/dater-map-view';
import { GeoCoordinates, GeoCompass } from '../types';
// import DaterButton from '../components/ui-kit/dater-button';
import MyLocationButton from '../components/map/my-location-button';
import MapPanelComponent from '../components/map/map-panel-component';

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
  compass: GeoCompass,
  // navigation: any,
};

class MainScreen extends Component<Props> {
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
        <MapPanelComponent />
        <DaterMapView />
        <MyLocationButton
          location={this.props.location}
          compass={this.props.compass}
        />

        {/* <DaterButton style={styles.button1} onPress={() => this.props.navigation.navigate('UIKit')}>
          UI Kit
        </DaterButton>
        <DaterButton style={styles.button2} onPress={() => this.props.navigation.navigate('Login')} type="secondary">
          Login
        </DaterButton> */}
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
