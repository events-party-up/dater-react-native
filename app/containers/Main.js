import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect } from 'react-redux';
import BackgroundGeolocation from 'react-native-background-geolocation';

import { DaterMapView } from '../components';
import { initUserAuth, signOutUser } from '../services/auth';
import { getGeoPosition } from '../services/geoDevice';
import { listenForUsersAround } from '../services/geoQuery';
import { geoActionCreators } from '../redux/index';

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

  componentWillMount() {
    this.authUnsubscribe = initUserAuth(this.props.dispatch);
    // this.geoWatchID = watchGeoPosition(this.props.dispatch);
    // getGeoPosition(this.props.dispatch);
    // This handler fires whenever bgGeo receives a location update.
    BackgroundGeolocation.on('location', this.onLocation, this.onError);

    // This handler fires when movement states changes (stationary->moving; moving->stationary)
    BackgroundGeolocation.on('motionchange', this.onMotionChange);

    // This event fires when a change in motion activity is detected
    BackgroundGeolocation.on('activitychange', this.onActivityChange);

    // This event fires when the user toggles location-services authorization
    BackgroundGeolocation.on('providerchange', this.onProviderChange);
    BackgroundGeolocation.configure({
      // Geolocation Config
      desiredAccuracy: 0,
      distanceFilter: 2,
      // Activity Recognition
      stopTimeout: 1,
      // Application config
      debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      stopOnTerminate: false, // <-- Allow the background-service to continue tracking when user closes the app.
      startOnBoot: true, // <-- Auto start tracking when device is powered-up.
      // HTTP / SQLite config
      batchSync: false, // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
      autoSync: false, // <-- [Default: true] Set true to sync each location to server as it arrives.
    }, (state) => {
      console.log('- BackgroundGeolocation is configured and ready: ', state.enabled);
      if (!state.enabled) {
        // 3. Start tracking!
        BackgroundGeolocation.start(() => {
          console.log('- Start success');
        });
      } else {
        getGeoPosition(this.props.dispatch);
      }
    });
  }

  onLocation = (location) => {
    console.log('- [event] location: ', location);
    this.props.dispatch(geoActionCreators.geoUpdated(location.coords));
  }

  onError = (error) => {
    console.warn('- [event] location error ', error);
  }

  onActivityChange = (activity) => {
    console.log('- [event] activitychange: ', activity); // eg: 'on_foot', 'still', 'in_vehicle'
  }

  onProviderChange = (provider) => {
    console.log('- [event] providerchange: ', provider);
  }

  onMotionChange = (location) => {
    console.log('- [event] motionchange: ', location.isMoving, location);
  }

  componentWillUnmount() {
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
