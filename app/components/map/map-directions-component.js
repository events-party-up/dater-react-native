import React, { Component } from 'react';
import { connect } from 'react-redux';
import MapView from 'react-native-maps';
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const DIAGONAL = Math.sqrt((width * width) + (height * height));

const mapStateToProps = (state) => ({
  mapDirections: state.mapDirections,
  visibleRadiusInMeters: state.mapView.visibleRadiusInMeters,
});

type Props = {
  mapDirections: any,
  visibleRadiusInMeters: number,
};

class MapDirectionsComponent extends Component<Props> {
  componentDidMount() {
  }

  render() {
    const pixelsPerMeter = DIAGONAL / (this.props.visibleRadiusInMeters * 2);

    return (
      this.props.mapDirections.visible && <MapView.Polyline
        coordinates={this.props.mapDirections.route.polyLines}
        strokeWidth={3 * pixelsPerMeter}
        strokeColor="green"
      />
    );
  }
}

export default connect(mapStateToProps)(MapDirectionsComponent);
