import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { connect } from 'react-redux';

type Region = {
  latitude: number,
  longitude: number,
  latitudeDelta: number,
  longitudeDelta: number,
  visibleRadiusInMeters?: number,
};

type Props = {
  coords: {
    latitude: number,
    longitude: number,
    accuracy: number,
    heading: number,
  },
  mapView: Region,
  onPress: (region: Region) => void,
  toggleGeoService: () => void,
};

const mapStateToProps = (state) => ({
  coords: state.geo.coords,
  mapView: state.mapView,
});

class MyLocationButton extends Component<Props> {
  onPress = () => {
    const myLocationRegion: Region = {
      latitude: this.props.coords.latitude,
      longitude: this.props.coords.longitude,
      latitudeDelta: this.props.mapView.latitudeDelta,
      longitudeDelta: this.props.mapView.longitudeDelta,
    };
    this.props.onPress(myLocationRegion);
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
          onPress={this.onGeoTogglePress}
        >
          <Text style={{ fontWeight: 'bold', color: 'black' }}>
            TGL
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={hitSlop}
          activeOpacity={0.7}
          style={styles.mapButton}
          onPress={this.onPress}
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
    backgroundColor: 'rgba(252, 253, 253, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: 8,
    shadowOpacity: 0.12,
    opacity: 0.6,
    zIndex: 10,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 100000,
  },
});

export default connect(mapStateToProps)(MyLocationButton);
