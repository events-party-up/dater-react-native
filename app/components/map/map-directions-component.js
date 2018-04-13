import React, { Component } from 'react';
import { connect } from 'react-redux';
import MapView from 'react-native-maps';

const mapStateToProps = (state) => ({
  mapDirections: state.mapDirections,
});

type Props = {
  mapDirections: any,
  // dispatch: Dispatch,
};

class MapDirectionsComponent extends Component<Props> {
  componentDidMount() {
  }

  render() {
    return (
      this.props.mapDirections.visible && <MapView.Polyline
        coordinates={this.props.mapDirections.route.polyLines}
        strokeWidth={4}
        strokeColor="green"
      />
    );
  }
}

export default connect(mapStateToProps)(MapDirectionsComponent);
