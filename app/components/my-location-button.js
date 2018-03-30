import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';

import { GeoCoordinates } from '../types';

type Props = {
  centerMe: (region: GeoCoordinates) => void,
  toggleGeoService: () => void,
  rotateMap: () => void,
  toggleCompass: () => void,
  location: {
    coords: GeoCoordinates,
  },
};

const mapStateToProps = (state) => ({
  location: state.location,
  mapView: state.mapView,
});

class MyLocationButton extends Component<Props> {
  centerMe = () => {
    // const myLocationRegion: GeoCoordinates = {
    //   latitude: this.props.location.coords.latitude,
    //   longitude: this.props.location.coords.longitude,
    //   latitudeDelta: this.props.mapView.latitudeDelta,
    //   longitudeDelta: this.props.mapView.longitudeDelta,
    // };
    this.props.centerMe(this.props.location.coords);
  }

  onGeoTogglePress = () => {
    this.props.toggleGeoService();
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
          onPress={this.props.toggleCompass}
        >
          <Text style={{ fontWeight: 'bold', color: 'black' }}>
            C
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={hitSlop}
          activeOpacity={0.7}
          style={styles.mapButton}
          onPress={this.props.rotateMap}
        >
          <Text style={{ fontWeight: 'bold', color: 'black' }}>
            R
          </Text>
        </TouchableOpacity>
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
    shadowOpacity: 0.12,
    opacity: 0.6,
    zIndex: 10,
    margin: 5,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 100000,
  },
});

export default connect(mapStateToProps)(MyLocationButton);
