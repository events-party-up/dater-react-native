import * as React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import {
  View,
  StyleSheet,
} from 'react-native';
import { GeoCoordinates } from '../../types';

type Props = {
  pastCoords: Array<GeoCoordinates>,
  mapViewHeadingAngle: number,
  uid: string;
  mode: 'target' | 'own',
};

class PastLocationMarker extends React.Component<Props> {
  renderPastLocations() {
    const totalPastCoords = this.props.pastCoords.length;
    if (totalPastCoords < 2) return null; // can't show direction marker just for 1 point

    return this.props.pastCoords.map((coord, index) => {
      if (index < 1) return null; // do not show marker for first point
      const borderBottomOpacity = 1 - ((totalPastCoords - index) / totalPastCoords);
      const borderBottomColor = this.props.mode ===
        'own' ? `rgba(128, 128, 128, ${borderBottomOpacity})` : `rgba(0, 128, 0, ${borderBottomOpacity})`;
      const rotation = coord.moveHeadingAngle - this.props.mapViewHeadingAngle;
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
          transform: [{ rotate: `${rotation}deg` }],
        },
      });
      // console.log(`Rotation in maker: ${coord.moveHeadingAngle} Rotation in map: ${this.props.mapViewHeadingAngle} Total rotation: ${rotation}`);
      return (
        <MapboxGL.PointAnnotation
          coordinate={[
            coord.longitude,
            coord.latitude,
          ]}
          key={`marker-${this.props.uid}-${coord.latitude}-${coord.longitude}-${index}`} // eslint-disable-line
          id={`marker-${this.props.uid}-${coord.latitude}-${coord.longitude}-${index}`} // eslint-disable-line
          // onDeselected={() => { this.onDeselected(); }}
          selected={false}
        >
          <View style={styles.triangle} />
        </MapboxGL.PointAnnotation>
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
