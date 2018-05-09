import * as React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { GeoCoordinates } from '../../types';
import GeoUtils from '../../utils/geo-utils';

type Props = {
  pastCoords: Array<GeoCoordinates>,
  uid: string;
  mode: 'target' | 'own',
};

class PastLocationMarker extends React.Component<Props> {
  mapStyles = MapboxGL.StyleSheet.create({
    path: {
      fillAntialias: true,
      fillColor: this.props.mode === 'own' ? 'rgba(128, 128, 128, 1)' : 'rgba(0, 128, 0, 1)',
      // fillOutlineColor: 'black',
      fillOpacity: 0.84,
    },
  });

  render() {
    if (this.props.pastCoords.length < 2) return null;

    const arrows = this.props.pastCoords.slice(1).map((coords, index) => {
      const { heading, distance } = coords;
      const arrowLength = 7;

      const destinationPoint1 = GeoUtils.destinationPoint(coords, -arrowLength, heading + 4);
      const destinationPoint2 = GeoUtils.destinationPoint(coords, -arrowLength, heading - 4);
      const destinationPoint3 = GeoUtils.destinationPoint(coords, -arrowLength, heading + 1);
      const destinationPoint4 = GeoUtils.destinationPoint(coords, -arrowLength, heading - 1);
      const destinationPoint5 = GeoUtils.destinationPoint(coords, -distance, heading + 1);
      const destinationPoint6 = GeoUtils.destinationPoint(coords, -distance, heading - 1);
      return {
        type: 'Feature',
        id: `arrow-${index}`,
        geometry: {
          type: 'Polygon',
          properties: {
            color: '#33C9EB', // blue
          },
          coordinates: [[
            // arrow
            [
              coords.longitude,
              coords.latitude,
            ],
            [
              destinationPoint1.longitude,
              destinationPoint1.latitude,
            ],
            [
              destinationPoint3.longitude,
              destinationPoint3.latitude,
            ],
            [
              destinationPoint5.longitude,
              destinationPoint5.latitude,
            ],
            [
              destinationPoint5.longitude,
              destinationPoint5.latitude,
            ],
            [
              destinationPoint6.longitude,
              destinationPoint6.latitude,
            ],
            [
              destinationPoint4.longitude,
              destinationPoint4.latitude,
            ],
            [
              destinationPoint2.longitude,
              destinationPoint2.latitude,
            ],
            [
              coords.longitude,
              coords.latitude,
            ],
          ]],
        },
      };
    });
    const shapeGeoJson = {
      type: 'FeatureCollection',
      features: [...arrows],
    };

    return (
      <MapboxGL.ShapeSource id={`past-paths-${this.props.uid}`} shape={shapeGeoJson}>
        <MapboxGL.FillLayer id={`past-paths-fill-${this.props.uid}`} style={this.mapStyles.path} />
      </MapboxGL.ShapeSource>
    );
  }
}

export default PastLocationMarker;
