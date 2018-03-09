import React, { Component, PropTypes } from 'react'
import { StyleSheet, } from 'react-native'
import MapView, { Circle } from 'react-native-maps';
import { connect } from 'react-redux'

import { geoActionCreators } from '../redux'

const mapStateToProps = (state) => ({
  coords: state.geo.coords,
})

class DaterMapView extends Component {

  componentDidMount() {
    //navigator.geolocation.requestAuthorization();
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log(position);
        this.props.dispatch(geoActionCreators.geoUpdated(position.coords));
      },
      (error) => console.log(error),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
  }

  render() {
    return (
      <MapView style={styles.mapView}
        region={{
          latitude: this.props.coords.latitude,
          longitude: this.props.coords.longitude,
          latitudeDelta: 0.00922,
          longitudeDelta: 0.00421,
        }}
      >
        <MapView.Circle
          style={styles.circleBig}
          key={'coord2' + this.props.coords.latitude}
          center={{
            latitude: this.props.coords.latitude,
            longitude: this.props.coords.longitude,
          }}
          radius={30}
          strokeColor={'#b0e0e6'}
          fillColor={'rgba(30,144,255,0.2)'}
        />
        <MapView.Circle
          key={'coord' + this.props.coords.latitude}
          center={{
            latitude: this.props.coords.latitude,
            longitude: this.props.coords.longitude,
          }}
          radius={7}
          strokeColor={'gray'}
          fillColor={'#00bfff'}
        />
      </MapView>
    )
  }
}

const styles = StyleSheet.create({
  mapView: {
    flex: 1,
  },
  circleBig: {
    opacity: 0.5,
  }

})

export default connect(mapStateToProps)(DaterMapView);
