import React, { Component } from 'react';
import { StyleSheet, Text, Button, View } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { connect } from 'react-redux';
import 'moment/locale/ru';
import Moment from 'react-moment';

import PersonMaker from './PersonMaker';
import MyLocationMapMarker from './MyLocationMapMarker';

const mapStateToProps = (state) => ({
  coords: state.geo.coords,
  usersAround: state.usersAround,
  mapView: state.geo.mapView,
  auth: state.auth,
});

type Props = {
  heading: number,
  usersAround: Array<mixed>,
  coords: {
    latitude: number,
    longitude: number,
    accuracy: number,
    heading: number,
  },
  mapView: {
    latitudeDelta: number,
    longitudeDelta: number,
  },
  auth: {
    uid: string,
  }
};

class DaterMapView extends Component<Props> {
  mapView;

  constructor(props) {
    super(props);
    this.routeTo = this.routeTo.bind(this);
  }

  componentWillUnmount() {
  }

  componentDidMount() {
    requestAnimationFrame(() => {
      this.mapView.animateToRegion({
        latitude: this.props.coords.latitude,
        longitude: this.props.coords.longitude,
        latitudeDelta: this.props.mapView.latitudeDelta,
        longitudeDelta: this.props.mapView.longitudeDelta,
      }, 1);
    });
  }

  routeTo = async (user) => {
    console.log(`Creating route to user: ${user.id}`);
  }

  // onRegionChangeComplete = (region) => {
  //   // this.props.dispatch(geoActionCreators.geoMapViewUpdated(region));
  // }

  onRegionChange = (region) => {
    console.log('Region updated');
    console.log(region);
  }

  renderUsersAround() {
    return this.props.usersAround.map((user) => (
      <Marker
        coordinate={{
          latitude: user.geoPoint.latitude,
          longitude: user.geoPoint.longitude,
        }}
        style={styles.maker}
        key={user.id}
        zIndex={1}
      >
        <PersonMaker title={user.shortId} />
        <Callout style={styles.makerCallout}>
          <Text>Расстояние: {user.distance} м</Text>
          <Text>Обновлено:{' '}
            <Moment locale="ru" element={Text} fromNow>{user.timestamp}</Moment>
          </Text>
          <Button title="Маршрут" onPress={() => this.routeTo(user)} />
        </Callout>
      </Marker>
    ));
  }

  render() {
    return (this.props.coords &&
      <View
        style={styles.mapView}
      >
        <MapView
          ref={(component) => { this.mapView = component; }}
          style={styles.mapView}
          initialRegion={{
            latitude: this.props.coords.latitude,
            longitude: this.props.coords.longitude,
            latitudeDelta: this.props.mapView.latitudeDelta,
            longitudeDelta: this.props.mapView.longitudeDelta,
          }}
          // onRegionChangeComplete={this.onRegionChangeComplete}
          // onRegionChange={this.onRegionChange}
          provider="google"
          showsIndoors
          showsTraffic={false}
          showsBuildings={false}
          // showsMyLocationButton={false}
          showsMyLocationButton
          // scrollEnabled={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          mapType="standard"
        >
          <MyLocationMapMarker
            coordinate={this.props.coords}
            heading={this.props.coords.heading}
          />
          {this.renderUsersAround()}
        </MapView>
        <Text style={styles.debugText}>
          Accuracy: {this.props.coords.accuracy}{'\n'}
          Heading: {this.props.coords.heading}{'\n'}
          Latitude: {this.props.coords.latitude}{'\n'}
          Longitude: {this.props.coords.longitude}{'\n'}
          UID: {this.props.auth.uid && this.props.auth.uid.substring(0, 4)}{'\n'}
        </Text>
      </View>

    );
  }
}

const styles = StyleSheet.create({
  mapView: {
    flex: 1,
  },
  makerCallout: {
    width: 150,
  },
  debugText: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    zIndex: 2,
    opacity: 0.8,
  },
});

export default connect(mapStateToProps)(DaterMapView);
