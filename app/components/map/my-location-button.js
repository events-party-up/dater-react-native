import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect, Dispatch } from 'react-redux';

import { GeoCoordinates, GeoCompass } from '../../types';

type Props = {
  dispatch: Dispatch,
  location: {
    coords: GeoCoordinates,
  },
  compass: GeoCompass,
};

const mapStateToProps = (state) => ({
  location: state.location,
  mapView: state.mapView,
});

class MyLocationButton extends Component<Props> {
  rotate = 90;

  centerMe = () => {
    this.props.dispatch({
      type: 'MAPVIEW_SHOW_MY_LOCATION_START',
      payload: {
        coords: this.props.location.coords,
      },
    });
  }

  onGeoTogglePress = () => {
    if (this.props.location.enabled) {
      this.props.dispatch({
        type: 'GEO_LOCATION_STOP',
      });
    } else {
      this.props.dispatch({
        type: 'GEO_LOCATION_START',
      });
    }
  }
  rotateMap = () => {
    this.rotate = this.rotate + 90;
    this.props.dispatch({
      type: 'MAPVIEW_ANIMATE_TO_BEARING_MANUALLY',
      payload: {
        bearingAngle: this.rotate,
        duratin: 2000,
      },
    });
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
    const hitSlop = {
      top: 15,
      bottom: 15,
      left: 15,
      right: 15,
    };

    return (
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          hitSlop={hitSlop}
          activeOpacity={0.7}
          style={styles.mapButton}
          onPress={this.toggleCompass}
        >
          <Text style={{ fontWeight: 'bold', color: 'black' }}>
            C
          </Text>
        </TouchableOpacity>
        {/* <TouchableOpacity
          hitSlop={hitSlop}
          activeOpacity={0.7}
          style={styles.mapButton}
          onPress={this.rotateMap}
        >
          <Text style={{ fontWeight: 'bold', color: 'black' }}>
            R
          </Text>
        </TouchableOpacity> */}
        <TouchableOpacity
          hitSlop={hitSlop}
          activeOpacity={0.7}
          style={styles.mapButton}
          onPress={this.onGeoTogglePress}
        >
          <Text style={{ fontWeight: 'bold', color: 'black' }}>
            {this.props.location.enabled ? 'OFF' : 'ON'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={hitSlop}
          activeOpacity={0.7}
          style={styles.mapButton}
          onPress={this.centerMe}
        >
          <Text style={{ fontWeight: 'bold', color: 'black' }}>
            Me
          </Text>
        </TouchableOpacity>
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
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 2,
  },
});

export default connect(mapStateToProps)(MyLocationButton);
