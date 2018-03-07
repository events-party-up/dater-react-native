import React, { Component, PropTypes } from 'react'
import { StyleSheet, } from 'react-native'
import MapView, { Circle } from 'react-native-maps';

export default class DaterMapView extends Component {
  latitude = 0;
  longitude = 0;

  constructor(props) {
    super(props);
    this.state = {
      latitude: 55.751244,
      longitude: 37.618423,
      error: null,
    };
  }

  componentDidMount() {
    //navigator.geolocation.requestAuthorization();
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        console.log(position);

        this.setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
        });
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
          latitude: this.state.latitude,
          longitude: this.state.longitude,
          latitudeDelta: 0.00922,
          longitudeDelta: 0.00421,
        }}
      >
        <MapView.Circle
          style={styles.circleBig}
          key={'coord2' + this.state.latitude}
          center={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
          }}
          radius={30}
          strokeColor={'#b0e0e6'}
          fillColor={'rgba(30,144,255,0.2)'}
        />
        <MapView.Circle
          key={'coord' + this.state.latitude}
          center={{
            latitude: this.state.latitude,
            longitude: this.state.longitude,
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
