import * as React from 'react';
import { Marker } from 'react-native-maps';

import {
  View,
  StyleSheet,
} from 'react-native';
import { GeoCoordinates } from '../../types';

type Props = {
  style: any,
  pastCoords: Array<GeoCoordinates>,
  rotate: number,
};

class PastLocationMarker extends React.Component<Props> {
  renderPastLocations() {
    const rotate = `${(this.props.rotate ? this.props.rotate : 0).toString()}deg`;
    const styles = StyleSheet.create({
      triangle: {
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftWidth: 6,
        borderRightWidth: 6,
        borderBottomWidth: 15,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'darkgray',
        zIndex: 5,
        transform: [
          {
            rotate,
          },
        ],
      },
    });

    return this.props.pastCoords.map((coord) => (
      <Marker
        key={`${coord.latitude}-${coord.longitude}`}
        coordinate={{
          latitude: coord.latitude,
          longitude: coord.longitude,
        }}
      >
        <View style={[styles.triangle, this.props.style]} />
      </Marker>
    ));
  }

  render() {
    return (
      <React.Fragment>
        { this.renderPastLocations() }
      </React.Fragment>
    );
  }
}

export default PastLocationMarker;
