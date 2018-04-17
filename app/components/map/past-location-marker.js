import React from 'react';
import { Marker } from 'react-native-maps';

import {
  View,
  StyleSheet,
} from 'react-native';
import { GeoCoordinates } from '../../types';

type Props = {
  style: any,
  coords: GeoCoordinates,
  rotate: number,
};

class PastLocationMarker extends React.Component<Props> {
  render() {
    const rotate = `${(this.props.rotate ? this.props.rotate : 0).toString()}deg`;

    const styles = StyleSheet.create({
      container: {
      },
      triangle: {
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 3,
        borderRightWidth: 3,
        borderBottomWidth: 10,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'gray',
        transform: [
          {
            rotate,
          },
        ],
      },
    });

    if (this.props.coords) {
      return (
        <Marker
          coordinate={{
            latitude: this.props.coords.latitude,
            longitude: this.props.coords.longitude,
          }}
        >
          <View style={[styles.triangle, this.props.style]} />
        </Marker>
      );
    }
    return null;
  }
}


export default PastLocationMarker;
