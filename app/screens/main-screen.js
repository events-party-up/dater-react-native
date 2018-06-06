import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect, Dispatch } from 'react-redux';

import DaterMapView from '../components/dater-map-view';
import DaterButton from '../components/ui-kit/dater-button';
import MapPanelComponent from '../components/map-panel/map-panel-component';
import OnMapRightButtons from '../components/map/on-map-right-buttons';
import { GeoCompass, GeoCoordinates } from '../types';
// import FirebaseSetup from '../components/firebase-setup';

const mapStateToProps = (state) => ({
  auth: state.auth,
});

type Props = {
  dispatch: Dispatch,
  navigation: any,
  compass: GeoCompass,
  location: GeoCoordinates,
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
        <MapPanelComponent
          navigation={this.props.navigation}
        />
        <DaterMapView />
        <OnMapRightButtons
          location={this.props.location}
          compass={this.props.compass}
        />
        <View style={styles.buttons}>
          <DaterButton
            style={styles.button}
            onPress={() => this.props.navigation.navigate('MakePhotoSelfie')}
            type="secondary"
          >
            Фото
          </DaterButton>
          <DaterButton
            style={styles.button}
            onPress={() => this.props.navigation.navigate('Floating')}
            type="secondary"
          >
            Floating Screen
          </DaterButton>

          <DaterButton
            style={styles.button}
            onPress={() => this.props.navigation.navigate('PhoneNumber')}
            type="secondary"
          >
            Phone Screen
          </DaterButton>

          <DaterButton
            style={styles.button}
            onPress={() => this.props.navigation.navigate('UIKit')}
          >
            UI Kit
          </DaterButton>
        </View>
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
  buttons: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  button: {
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
