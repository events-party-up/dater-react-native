import React, { Component } from 'react'
import { StyleSheet, View, Text, Button } from 'react-native'
import MapView, { Circle, Marker, Callout } from 'react-native-maps';
import { connect } from 'react-redux'

import { geoActionCreators } from '../redux'
import PersonMaker from "./PersonMaker";

const mapStateToProps = (state) => ({
  coords: state.geo.coords,
})

class DaterMapView extends Component {

  componentDidMount() {
    //navigator.geolocation.requestAuthorization();
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        this.props.dispatch(geoActionCreators.geoUpdated(position.coords));
      },
      (error) => this.props.dispatch(geoActionCreators.geoDenied(error)),
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
        <Marker
          coordinate={{
            latitude: 55.807237,
            longitude: 37.541678,
          }}
          style={styles.maker}
          title={'Test Title'}
          description={'Test Description'}
        >
          <PersonMaker title='test test test test'></PersonMaker>
        </Marker>  
        <MapView.Circle
          style={styles.circleBig}
          key={'coord2' + this.props.coords.latitude}
          center={{
            latitude: this.props.coords.latitude,
            longitude: this.props.coords.longitude,
          }}
          radius={this.props.coords.accuracy}
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
  },
  maker: {

  }

})

export default connect(mapStateToProps)(DaterMapView);
