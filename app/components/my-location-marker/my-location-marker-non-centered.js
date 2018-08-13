import React from 'react';

import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { GeoCoordinates } from '../../types';
import MyLocationMarkerCentered from './my-location-marker-centered';

type State = {
  compassHeading: number,
}

type Props = {
  heading: number,
  mapViewHeadingAngle: number,
  compassHeading: number,
  coords: GeoCoordinates,
  mapViewModeIsSwitching: boolean,
  headingToTarget: number,
  microDateEnabled: boolean,
  searchIsPending: boolean,
  accuracy: number,
  visibleRadiusInMeters: number,
  appState: any,
};

export default class MyLocationMarkerNonCentered extends React.Component<Props, State> {
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
        <MyLocationMarkerCentered
          heading={this.props.compassHeading || this.props.heading}
          mapViewHeadingAngle={this.props.mapViewHeadingAngle}
          mapViewModeIsSwitching={this.props.mapViewModeIsSwitching}
          headingToTarget={this.props.headingToTarget}
          microDateEnabled={this.props.microDateEnabled}
          accuracy={this.props.accuracy}
          visibleRadiusInMeters={this.props.visibleRadiusInMeters}
          appState={this.props.appState}
          searchIsPending={this.props.searchIsPending}
        />
      </MapboxGL.PointAnnotation>
    );
  }
}
