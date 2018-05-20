import * as React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { GeoCoordinates } from '../../types';

type Props = {
  pastCoords: Array<GeoCoordinates>,
  mode: 'target' | 'own',
};

class PastLocationsLines extends React.Component<Props> {
  strokeColorOpacity = 1;
  layerStyles = MapboxGL.StyleSheet.create({
    route: {
      lineColor: this.props.mode ===
        'own' ? `rgba(128, 128, 128, ${this.strokeColorOpacity})` : `rgba(0, 128, 0, ${this.strokeColorOpacity})`,
      lineWidth: 1.5,
      lineOpacity: 0.84,
      lineDasharray: [3, 3],
    },
  });

  render() {
    if (this.props.pastCoords.length <= 1) return null;
    const shapeGeoJson = {
      route:
        {
          type: 'FeatureCollection',
          features: [
            {
              type: 'Feature',
              properties: {
                color: '#F7455D', // red
              },
              geometry: {
                type: 'LineString',
                coordinates: this.props.pastCoords.map((coords) => [coords.longitude, coords.latitude]),
              },
            },
          ],
        },
    };

    return (
      <React.Fragment>
        <MapboxGL.ShapeSource
          id={`past-paths-lines-shape-${this.props.mode}`}
          shape={shapeGeoJson.route}
        >
          <MapboxGL.LineLayer
            id={`past-paths-lines-layer--${this.props.mode}`}
            style={this.layerStyles.route}
            belowLayerID={`past-paths-arrows-layer-${this.props.mode}`}
          />
        </MapboxGL.ShapeSource>
      </React.Fragment>
    );
  }
}

export default PastLocationsLines;
