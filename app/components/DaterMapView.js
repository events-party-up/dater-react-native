import React, { Component } from 'react'
import { StyleSheet, View, Text, Button, Dimensions } from 'react-native'
import MapView, { Circle, Marker, Callout } from 'react-native-maps';
import { connect } from 'react-redux'
import 'moment/locale/ru';

import Moment from 'react-moment';

import { geoActionCreators } from '../redux'
import PersonMaker from "./PersonMaker";
import { getUsersAroundOnce, listenForUsersAround, distance } from "../services/geoQuery";

const mapStateToProps = (state) => ({
  coords: state.geo.coords,
  usersAround: state.usersAround,
})
const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.00922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

class DaterMapView extends Component {
  constructor(props) {
    super(props);
    this.routeTo = this.routeTo.bind(this);
  }

  async componentDidMount() {
    //navigator.geolocation.requestAuthorization();
    this.watchId = navigator.geolocation.watchPosition(
      async (position) => {
        await this.props.dispatch(geoActionCreators.geoUpdated(position.coords));
        const queryArea = {
          center: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          radius: 25,
        };
        this.unsubscribeFromUsersAround = listenForUsersAround(queryArea, this.props.dispatch);
      },
      (error) => this.props.dispatch(geoActionCreators.geoDenied(error)),
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 1000 },
    );
  }

  componentWillUnmount() {
    navigator.geolocation.clearWatch(this.watchId);
    this.unsubscribeFromUsersAround();
  }

  routeTo = async (user) => {
    console.log('Creating route to user: ' + user.id);
  }

  onRegionChangeComplete (region) {
    const center = {
      latitude: region.latitude,
      longitude: region.longitude,
    };
    const corner = {
      latitude: center.latitude + region.latitudeDelta,
      longitude: region.longitude + region.latitudeDelta,
    }
    console.log('Viewable approx radius in m: ', distance(center, corner) );
  }

  renderUsersAround() {
    return this.props.usersAround.map(user => {
      return (
        <Marker
          coordinate={{
            latitude: user.geoPoint.latitude,
            longitude: user.geoPoint.longitude,
          }}
          style={styles.maker}
          key={user.id}
          zIndex={1}
        >
          <PersonMaker title={user.shortId}></PersonMaker>
          <Callout style={styles.makerCallout}>
            <Text>Расстояние: {user.distance} м</Text>
            <Text>Обновлено:{' '}
              <Moment locale="ru" element={Text} fromNow>{user.timestamp}</Moment>
            </Text>
            <Button title='Маршрут' onPress={() => this.routeTo(user)}>
            </Button>
          </Callout>
        </Marker>
      )
    });
  }

  render() {
    return (
      <MapView style={styles.mapView}
        showsMyLocationButton={true}
        region={{
          latitude: this.props.coords.latitude,
          longitude: this.props.coords.longitude,
          latitudeDelta: LATITUDE_DELTA,
          longitudeDelta: LONGITUDE_DELTA,
        }}
        onRegionChangeComplete={this.onRegionChangeComplete}
        provider='google'
        showsBuildings={true}
        showsTraffic={false}
        showsIndoors={true}
        showsTraffic={false}
        showsBuildings={false}
        showsMyLocationButton={false}
      >
        <MapView.Circle
          style={styles.circleAccuracy}
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
          style={styles.circleCenter}
          key={'coord' + this.props.coords.latitude}
          center={{
            latitude: this.props.coords.latitude,
            longitude: this.props.coords.longitude,
          }}
          radius={7}
          strokeColor={'gray'}
          fillColor={'#00bfff'}
          zIndex={10}
          />
        {this.renderUsersAround()}
      </MapView>
    )
  }
}

const styles = StyleSheet.create({
  mapView: {
    flex: 1,
  },
  circleAccuracy: {
    opacity: 0.5,
    zIndex: 4,
  },
  circleCenter: {
    zIndex: 4,
  },
  maker: {
    zIndex: 1,
  },
  makerCallout: {
    width: 150,
  }
})

export default connect(mapStateToProps)(DaterMapView);
