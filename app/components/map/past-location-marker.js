import * as React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { GeoCoordinates } from '../../types';
import GeoUtils from '../../utils/geo-utils';

const triangleLatDelta = 0.00001;
const triangleLngDelta = 0.00001;
const lineDelta = 0.000001;

type Props = {
  pastCoords: Array<GeoCoordinates>,
  uid: string;
  mode: 'target' | 'own',
};

class PastLocationMarker extends React.Component<Props> {
  mapStyles = MapboxGL.StyleSheet.create({
    path: {
      // fillAntialias: true,
      fillColor: this.props.mode === 'own' ? 'rgba(128, 128, 128, 1)' : 'rgba(0, 128, 0, 1)',
      // fillOutlineColor: 'black',
      // fillOpacity: 0.84,
    },
  });

  render() {
    if (this.props.pastCoords.length < 2) return null;

    const lines = this.props.pastCoords.slice(1).map((coords, index) => {
      if (index === (this.props.pastCoords.length - 2)) {
        const previousCoords = this.props.pastCoords[index];
        console.log('Rotation angle: ', GeoUtils.getRotationAngle(previousCoords, coords));
      }

      return {
        type: 'Feature',
        id: `line-${index}`,
        geometry: {
          type: 'Polygon',
          coordinates: [[
            // line
            [
              this.props.pastCoords[index].longitude + lineDelta,
              this.props.pastCoords[index].latitude + lineDelta,
            ],
            [
              this.props.pastCoords[index].longitude - lineDelta,
              this.props.pastCoords[index].latitude - lineDelta,
            ],
            [
              coords.longitude - lineDelta,
              coords.latitude - lineDelta,
            ],
            [
              coords.longitude + lineDelta,
              coords.latitude + lineDelta,
            ],
            [
              this.props.pastCoords[index].longitude + lineDelta,
              this.props.pastCoords[index].latitude + lineDelta,
            ],
            [
              this.props.pastCoords[index].longitude + lineDelta,
              this.props.pastCoords[index].latitude + lineDelta,
            ],
          ]],
        },
      };
    });

    const arrows = this.props.pastCoords.slice(1).map((coords, index) => (
      {
        type: 'Feature',
        id: `arrow-${index}`,
        geometry: {
          type: 'Polygon',
          coordinates: [[
            // arrow
            [
              coords.longitude,
              coords.latitude,
            ],
            [
              this.props.pastCoords[index].longitude + triangleLngDelta,
              this.props.pastCoords[index].latitude + triangleLatDelta],
            [
              this.props.pastCoords[index].longitude - triangleLngDelta,
              this.props.pastCoords[index].latitude - triangleLatDelta,
            ],
            [
              coords.longitude,
              coords.latitude,
            ],
          ]],
        },
      }));

    const newArrows = this.props.pastCoords.slice(1).map((coords, index) => {
      const startLat = this.props.pastCoords[index].latitude;
      const startLon = this.props.pastCoords[index].longitude;
      const startLatRad = GeoUtils.toRad(startLat);
      const startLonRad = GeoUtils.toRad(startLon);
      const { distance, heading } = coords;
      const earthR = 6371000;

      const endLatRad1 = (Math.asin(Math.sin(startLatRad) * Math.cos(distance / earthR)) +
        (Math.cos(startLatRad) * Math.sin(distance / earthR) * Math.cos(GeoUtils.toRad(heading - 5))));
      const endLonRad1 = startLonRad + Math.atan2(
        Math.sin(GeoUtils.toRad(heading - 5)) * Math.sin(distance / earthR) * Math.cos(startLatRad),
        Math.cos(distance / earthR) - (Math.sin(startLatRad) * Math.sin(endLatRad1)),
      );

      const endLatRad2 = (Math.asin(Math.sin(startLatRad) * Math.cos(distance / earthR)) +
        (Math.cos(startLatRad) * Math.sin(distance / earthR) * Math.cos(GeoUtils.toRad(heading + 5))));
      const endLonRad2 = startLonRad + Math.atan2(
        Math.sin(GeoUtils.toRad(heading + 5)) * Math.sin(distance / earthR) * Math.cos(startLatRad),
        Math.cos(distance / earthR) - (Math.sin(startLatRad) * Math.sin(endLatRad2)),
      );
      // const endLatDeg = GeoUtils.toDeg(endLatRad);
      // const endLonDeg = GeoUtils.toDeg(endLonRad);
      // console.log(`endLatRad: ${endLatRad} endLonRad: ${endLonRad}`);
      console.log(`distance: ${distance} heading: ${heading}`);
      
      return {
        type: 'Feature',
        id: `arrow-${index}`,
        geometry: {
          type: 'Polygon',
          coordinates: [[
            // arrow
            [
              this.props.pastCoords[index].longitude,
              this.props.pastCoords[index].latitude,
            ],
            [
              GeoUtils.toDeg(endLonRad1),
              GeoUtils.toDeg(endLatRad1),
            ],
            [
              GeoUtils.toDeg(endLonRad2),
              GeoUtils.toDeg(endLatRad2),
            ],
            [
              this.props.pastCoords[index].longitude,
              this.props.pastCoords[index].latitude,
            ],
          ]],
        },
      };
    });

    const shapeGeoJson = {
      type: 'FeatureCollection',
      features: [...newArrows],
    };

    return (
      <MapboxGL.ShapeSource id={`past-paths-${this.props.uid}`} shape={shapeGeoJson}>
        <MapboxGL.FillLayer id={`past-paths-fill-${this.props.uid}`} style={this.mapStyles.path} />
      </MapboxGL.ShapeSource>
    );
  }
}

export default PastLocationMarker;
