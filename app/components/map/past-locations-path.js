import * as React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { GeoCoordinates } from '../../types';
import GeoUtils from '../../utils/geo-utils';

type Props = {
  pastCoords: Array<GeoCoordinates>,
  mode: 'target' | 'own',
};

class PastLocationsPath extends React.Component<Props> {
  mapStyles = MapboxGL.StyleSheet.create({
    path: {
      fillAntialias: true,
      fillColor: this.props.mode === 'own' ? 'rgba(128, 128, 128, 1)' : 'rgba(0, 128, 0, 1)',
      // fillOutlineColor: 'black',
      // fillOpacity: 0.84,
    },
  });

  render() {
    if (this.props.pastCoords.length < 2) return null;

    const arrows = this.props.pastCoords.slice(1).map((coords, index) => {
      const { heading, distance } = coords;
      const arrowHeadLength = 7; // in meters
      let arrowTailLength = 7;
      arrowTailLength = arrowTailLength * 2 > distance ? distance : arrowTailLength * 2;
      const arrowSkirtLeft = GeoUtils.destinationPoint(coords, -arrowHeadLength, heading + 20);
      const arrowSkirtRight = GeoUtils.destinationPoint(coords, -arrowHeadLength, heading - 20);
      const arrowLineStartLeft = GeoUtils.destinationPoint(coords, -arrowHeadLength, heading + 4);
      const arrowLineStartRight = GeoUtils.destinationPoint(coords, -arrowHeadLength, heading - 4);
      const arrowLineEndLeft = GeoUtils.destinationPoint(coords, -arrowTailLength, heading + 1);
      const arrowLineEndRight = GeoUtils.destinationPoint(coords, -arrowTailLength, heading - 1);

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
      <MapboxGL.ShapeSource
        id={`past-paths-arrows-shape-${this.props.mode}`}
        shape={shapeGeoJson}
      >
        <MapboxGL.FillLayer
          id={`past-paths-arrows-layer-${this.props.mode}`}
          style={this.mapStyles.path}
          minZoomLevel={0}
          maxZoomLevel={20}
        />
      </MapboxGL.ShapeSource>
    );
  }
}

export default PastLocationsPath;
