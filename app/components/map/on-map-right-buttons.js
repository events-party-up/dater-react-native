import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { Dispatch } from 'react-redux';

import { GeoCoordinates } from '../../types';
import CircleButton from '../ui-kit/circle-button';
import { Actions } from '../../navigators/navigator-actions';

const myLocationIcon = require('../../assets/icons/my-location/48/my-location.png');
const playIcon = require('../../assets/icons/play/play.png');
const stopIcon = require('../../assets/icons/stop/stop.png');
const myProfileIcon = require('../../assets/icons/my-profile/my-profile.png');
// const rotateIcon = require('../../assets/icons/rotate-map/rotate-map.png');

type Props = {
  dispatch: Dispatch,
  location: {
    coords: GeoCoordinates,
    enabled: boolean,
  },
  heading: number,
  microDateIsEnabled: boolean,
  isAuthenticated: boolean,
};

class OnMapRightButtons extends Component<Props> {
  rotate = 0;

  centerMe = () => {
    if (this.props.location.enabled === true) {
      this.props.dispatch({
        type: 'MAPVIEW_SWITCH_VIEW_MODE_START',
        payload: {
          heading: this.props.heading,
        },
      });
    }
  }

  onGeoTogglePress = () => {
    if (this.props.location.enabled) {
      this.props.dispatch({
        type: 'GEO_LOCATION_STOP',
      });
    } else {
      this.props.dispatch({
        type: 'GEO_LOCATION_START_MANUALLY',
      });
    }
  }
  rotateMap = () => {
    if (this.props.location.enabled === true) {
      this.rotate = this.rotate + 90;
      if (this.rotate >= 360) this.rotate = 0;
      this.props.dispatch({
        type: 'MAPVIEW_ANIMATE_TO_HEADING_MANUALLY',
        payload: {
          heading: this.rotate,
          duration: 500,
        },
      });
    }
  }

  onMyProfilePress = () => {
    Actions.navigate({
      key: 'EditProfile',
      routeName: 'RegisterProfile',
      params: {
        navigationFlowType: 'mapViewModal',
      },
    });
  }

  render() {
    return (
      <View style={styles.buttonContainer}>
        {/* <CircleButton
          style={styles.button}
          onPress={this.rotateMap}
          image={rotateIcon}
          size="medium"
        /> */}
        {this.props.isAuthenticated &&
          <CircleButton
            style={[styles.button, { opacity: 0.8 }]}
            onPress={this.onMyProfilePress}
            image={myProfileIcon}
            size="medium"
          />
        }
        {!this.props.microDateIsEnabled &&
          <CircleButton
            style={styles.button}
            onPress={this.onGeoTogglePress}
            image={this.props.location.enabled ? stopIcon : playIcon}
            size="medium"
            disabled={!this.props.isAuthenticated}
          />
        }
        <CircleButton
          style={styles.button}
          onPress={this.centerMe}
          image={myLocationIcon}
          size="medium"
          disabled={!this.props.location.enabled}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
  mapButton: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: 'rgba(255, 255, 253, 0.8)',
    borderColor: 'gray',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: 8,
    shadowOpacity: 0,
    opacity: 0.6,
    margin: 5,
  },
  button: {
    opacity: 0.6,
    margin: 4,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default OnMapRightButtons;
