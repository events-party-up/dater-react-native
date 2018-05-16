import * as React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { GeoCoordinates } from '../../types';
import GeoUtils from '../../utils/geo-utils';

type Props = {
  pastCoords: Array<GeoCoordinates>,
  uid: string;
  mode: 'target' | 'own',
};

class PastLocationsPath extends React.Component<Props> {
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
      const arrowLength = 7; // in meters

      const arrowSkirtLeft = GeoUtils.destinationPoint(coords, -arrowLength, heading + 10);
      const arrowSkirtRight = GeoUtils.destinationPoint(coords, -arrowLength, heading - 10);
      const arrowLineStartLeft = GeoUtils.destinationPoint(coords, -arrowLength, heading + 4);
      const arrowLineStartRight = GeoUtils.destinationPoint(coords, -arrowLength, heading - 4);
      const arrowLineEndLeft = GeoUtils.destinationPoint(coords, -distance, heading + 2);
      const arrowLineEndRight = GeoUtils.destinationPoint(coords, -distance, heading - 2);

      return {
        type: 'Feature',
        id: `arrow-${index}`,
        geometry: {
          type: 'Polygon',
          properties: {
            color: '#33C9EB', // blue
          },
          coordinates: [[
            // arrow tip
            [
              coords.longitude,
              coords.latitude,
            ],
            [
              arrowSkirtLeft.longitude,
              arrowSkirtLeft.latitude,
            ],
            [
              arrowLineStartLeft.longitude,
              arrowLineStartLeft.latitude,
            ],
            [
              arrowLineEndLeft.longitude,
              arrowLineEndLeft.latitude,
            ],
            [
              arrowLineEndRight.longitude,
              arrowLineEndRight.latitude,
            ],
            [
              arrowLineStartRight.longitude,
              arrowLineStartRight.latitude,
            ],
            [
              arrowSkirtRight.longitude,
              arrowSkirtRight.latitude,
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
        <MapboxGL.FillLayer
          id={`past-paths-fill-${this.props.uid}`}
          style={this.mapStyles.path}
          minZoomLevel={11}
          maxZoomLevel={18}
        />
      </MapboxGL.ShapeSource>
    );
  }
}

export default PastLocationsPath;
