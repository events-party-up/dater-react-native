import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect, Dispatch } from 'react-redux';

import { GeoCoordinates, GeoCompass } from '../../types';
import CircleButton from '../ui-kit/circle-button';

const myLocationIcon = require('../../assets/icons/my-location/48/my-location.png');
const playIcon = require('../../assets/icons/play/play.png');
const stopIcon = require('../../assets/icons/stop/stop.png');
// const rotateIcon = require('../../assets/icons/rotate-map/rotate-map.png');
// const compassIcon = require('../../assets/icons/compass-colored/compass-colored.png');

type Props = {
  dispatch: Dispatch,
  location: {
    coords: GeoCoordinates,
    enabled: boolean,
  },
  compass: GeoCompass,
  microDateIsEnabled: boolean,
  isAuthenticated: boolean,
};

const mapStateToProps = (state) => ({
  location: state.location,
  mapView: state.mapView,
  isAuthenticated: state.auth.isAuthenticated,
  microDateIsEnabled: state.microDate.enabled,
});

class OnMapRightButtons extends Component<Props> {
  rotate = 0;

  centerMe = () => {
    if (this.props.location.enabled === true) {
      this.props.dispatch({
        type: 'MAPVIEW_SWITCH_VIEW_MODE_START',
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

  toggleCompass = () => {
    if (this.props.compass.enabled) {
      this.props.dispatch({
        type: 'GEO_COMPASS_HEADING_STOP',
      });
    } else {
      this.props.dispatch({
        type: 'GEO_COMPASS_HEADING_START',
      });
    }
  }

  render() {
    return (
      <View style={styles.buttonContainer}>
        {/* <CircleButton
          style={styles.button}
          onPress={this.toggleCompass}
          image={compassIcon}
          size="medium"
        /> */}
        {/* <CircleButton
          style={styles.button}
          onPress={this.rotateMap}
          image={rotateIcon}
          size="medium"
        /> */}
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

export default connect(mapStateToProps)(OnMapRightButtons);
