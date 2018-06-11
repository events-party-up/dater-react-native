import React from 'react';

import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { GeoCoordinates } from '../../types';
import MyLocationOnCenteredMap from './my-location-on-centered-map';

type State = {
  compassHeading: number,
}

type Props = {
  moveHeadingAngle: number,
  mapViewHeadingAngle: number,
  compassHeading: number,
  coords: GeoCoordinates,
};

class MyLocationOnNonCenteredMap extends React.Component<Props, State> {
  render() {
    return (
      <MapboxGL.PointAnnotation
        coordinate={[
          this.props.coords.longitude,
          this.props.coords.latitude,
        ]}
        key="heading-non-centered"
        id="heading-non-centered"
        selected={false}
        anchor={{ x: 0.5, y: 0.5 }} // anchor so that bottom tip of the marker is at the geo point
      >
        <MyLocationOnCenteredMap
          heading={this.props.compassHeading || this.props.moveHeadingAngle}
          mapViewHeadingAngle={this.props.mapViewHeadingAngle}
        />
      </MapboxGL.PointAnnotation>
    );
  }
}

export default MyLocationOnNonCenteredMap;
