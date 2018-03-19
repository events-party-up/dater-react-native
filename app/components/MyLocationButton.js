import React, { Component } from 'react';
import {
  TouchableOpacity,
  StyleSheet,
  Text,
  View,
} from 'react-native';

// import watchGeoPosition from '../services/geoDevice';

type Props = {
};

class MyLocationButton extends Component<Props> {
  locateMe = () => {
    console.log('Locate me');
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
          onPress={() => this.locateMe()}
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

export default MyLocationButton;
