import React, { Component } from 'react';
import { connect } from 'react-redux';
import MapView from 'react-native-maps';
import { SCREEN_DIAGONAL } from '../../constants';

const mapStateToProps = (state) => ({
  mapDirections: state.mapDirections,
  visibleRadiusInMeters: state.mapView.visibleRadiusInMeters,
});

const defaultStrokeWidth = 3;

type Props = {
  mapDirections: any,
  visibleRadiusInMeters: number,
};

class MapDirectionsComponent extends Component<Props> {
  componentDidMount() {
  }

  render() {
    const pixelsPerMeter = SCREEN_DIAGONAL / (this.props.visibleRadiusInMeters * 2);
    const strokeWidth = 3 * pixelsPerMeter > defaultStrokeWidth ? 3 * pixelsPerMeter : defaultStrokeWidth;

    return (
      this.props.mapDirections.visible && <MapView.Polyline
        coordinates={this.props.mapDirections.route.polyLines}
        strokeWidth={strokeWidth}
        strokeColor="green"
      />
    );
  }
}

export default connect(mapStateToProps)(MapDirectionsComponent);
