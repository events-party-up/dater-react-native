import * as React from 'react';
import { Marker } from 'react-native-maps';

import {
  View,
  StyleSheet,
} from 'react-native';
import { GeoCoordinates } from '../../types';

type Props = {
  pastCoords: Array<GeoCoordinates>,
  mapViewBearingAngle: number,
};

class PastLocationMarker extends React.Component<Props> {
  renderPastLocations() {
    const totalPastCoords = this.props.pastCoords.length;
    if (totalPastCoords < 2) return null; // can't show direction marker just for 1 point

    return this.props.pastCoords.map((coord, index) => {
      if (index < 1) return null; // do not show marker for first point
      const borderBottomOpacity = 1 - ((totalPastCoords - index) / totalPastCoords);
      const borderBottomColor = `rgba(128, 128, 128, ${borderBottomOpacity})`;
      const styles = StyleSheet.create({
        triangle: {
          backgroundColor: 'transparent',
          borderStyle: 'solid',
          borderLeftWidth: 6,
          borderRightWidth: 6,
          borderBottomWidth: 15,
          borderLeftColor: 'transparent',
          borderRightColor: 'transparent',
          borderBottomColor,
        },
      });
      const rotation = coord.moveHeadingAngle - this.props.mapViewBearingAngle;
      // console.log(`Rotation in maker: ${coord.moveHeadingAngle} Rotation in map: ${this.props.mapViewBearingAngle} Total rotation: ${rotation}`);
      return (
        <Marker
          key={`marker-${coord.latitude}-${coord.longitude}-${index}`} // eslint-disable-line
          coordinate={{
            latitude: coord.latitude,
            longitude: coord.longitude,
          }}
          rotation={rotation}
        >
          <View style={styles.triangle} />
        </Marker>
      );
    });
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
