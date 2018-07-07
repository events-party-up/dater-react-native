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
  mapViewModeIsSwitching: boolean,
  headingToTarget: number,
  microDateEnabled: boolean,
  accuracy: number,
  visibleRadiusInMeters: number,
  appState: any,
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
          mapViewModeIsSwitching={this.props.mapViewModeIsSwitching}
          headingToTarget={this.props.headingToTarget}
          microDateEnabled={this.props.microDateEnabled}
          accuracy={this.props.accuracy}
          visibleRadiusInMeters={this.props.visibleRadiusInMeters}
          appState={this.props.appState}
        />
      </MapboxGL.PointAnnotation>
    );
  }
}

export default MyLocationOnNonCenteredMap;
