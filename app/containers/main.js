import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  // Button,
} from 'react-native';
import { connect, Dispatch } from 'react-redux';

import { DaterMapView } from '../components';
import listenForUsersAround from '../services/geo-query';
import { GeoCoordinates } from '../types';

const mapStateToProps = (state) => ({
  auth: state.auth,
  // coords: state.geo.coords,
  location: state.location,
});

type Props = {
  dispatch: Dispatch,
  location: {
    coords: GeoCoordinates,
  },
};

class Main extends Component<Props> {
  authUnsubscribe;
  unsubscribeFromUsersAround;

  async componentWillMount() {
    // this.authUnsubscribe = initUserAuth(this.props.dispatch);
  }

  componentWillUnmount() {
    this.unsubscribeFromUsersAround();
    // this.authUnsubscribe();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.coords && !this.unsubscribeFromUsersAround) {
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
    // await signOutUser(this.props.dispatch);
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
