import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  Button,
  View,
  NativeEventEmitter,
} from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { connect, DeviceEventEmitter, Dispatch } from 'react-redux';
import 'moment/locale/ru';
import Moment from 'react-moment';
import ReactNativeHeading from '@zsajjad/react-native-heading';

import PersonMaker from './person-maker';
import MyLocationMapMarker from './my-location-map-maker';
import MyLocationButton from './my-location-button';
import { GeoCompass, GeoCoordinates } from '../types';
import GeoUtils from '../utils';

const mapStateToProps = (state) => ({
  coords: state.geo.coords,
  location: state.geo,
  usersAround: state.usersAround,
  mapView: state.mapView,
  auth: state.auth,
  geoUpdates: state.geo.geoUpdates,
  compass: state.compass,
});

function mapDispatchToProps(dispatch) {
  return ({
    animateToRegion: (mapView: MapView, region: GeoCoordinates) => {
      dispatch({
        type: 'MAPVIEW_ANIMATE_TO_REGION',
        payload: {
          mapView,
          region,
        },
      });
    },
    onRegionChangeComplete: (newRegion, prevRegion) => {
      if (!prevRegion || !newRegion) return;

      dispatch({
        type: 'MAPVIEW_REGION_UPDATED',
        payload: {
          newRegion,
          prevRegion,
        },
      });
    },
    toggleGeoService: (location) => {
      if (location.enabled) {
        dispatch({
          type: 'GEO_LOCATION_STOP',
        });
      } else {
        dispatch({
          type: 'GEO_LOCATION_START',
        });
      }
    },
    rotateMap: (mapView: MapView, angle: number) => {
      mapView.animateToBearing(angle);
    },
    toggleCompass: (compassStatus) => {
      if (compassStatus) {
        dispatch({
          type: 'GEO_COMPASS_HEADING_STOP',
        });
      } else {
        dispatch({
          type: 'GEO_COMPASS_HEADING_START',
        });
      }
    },
    dispatch: (action) => dispatch(action),
  });
}


type Props = {
  usersAround: Array<mixed>,
  coords: GeoCoordinates,
  auth: {
    uid: string,
  },
  compass: GeoCompass,
  geoUpdates: number,
  animateToRegion: any,
  onRegionChangeComplete: (newRegion: GeoCoordinates, prevRegion: GeoCoordinates) => void,
  toggleGeoService: () => void,
  rotateMap: (mapView: MapView, angle:number) => void,
  toggleCompass: (compassStatus: boolean) => void,
  dispatch: Dispatch,
  location: any,
};

class DaterMapView extends Component<Props> {
  mapView: MapView;
  listener = new NativeEventEmitter(ReactNativeHeading);

  constructor(props) {
    super(props);
    this.routeTo = this.routeTo.bind(this);
  }
  async componentWillMount() {
    this.listener.addListener('headingUpdated', (heading) => {
      this.props.dispatch({ type: 'GEO_COMPASS_HEADING_UPDATE', payload: heading });
      this.props.dispatch({
        type: 'MAPVIEW_ROTATE',
        payload: {
          mapView: this.mapView,
          rotationAngle: GeoUtils.wrapCompassHeading(heading),
        },
      });
    });
  }

  componentDidMount() {
  }

  onMapReady= () => {
    this.props.dispatch({ type: 'GEO_LOCATION_INITIALIZE', payload: this.mapView });
    this.props.dispatch({ type: 'MAPVIEW_READY' });
  }

  componentWillUnmount() {
    DeviceEventEmitter.removeAllListeners('headingUpdated');
    this.props.dispatch({
      type: 'GEO_COMPASS_HEADING_STOP',
    });
  }

  routeTo = async (user) => {
    console.log(`Creating route to user: ${user.id}`);
  }

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
    return (
      <View
        style={styles.mapView}
      >
        <MyLocationButton
          toggleGeoService={() => this.props.toggleGeoService(this.props.location)}
          onPress={(region) => this.props.animateToRegion(this.mapView, region)}
          rotateMap={() => this.props.rotateMap(this.mapView, 90)}
          toggleCompass={() => this.props.toggleCompass(this.props.compass.enabled)}
        />
        <MapView
          ref={(component) => { this.mapView = component; }}
          style={styles.mapView}
          onRegionChangeComplete={(region) => this.props.onRegionChangeComplete(region, this.props.coords)}
          onMapReady={this.onMapReady}
          // onRegionChange={this.onRegionChange}
          provider="google"
          showsIndoors
          showsTraffic={false}
          showsBuildings={false}
          // scrollEnabled={false}
          toolbarEnabled={false}
          moveOnMarkerPress={false}
          rotateEnabled={false}
          mapType="standard"
        >
          {this.props.location.enabled && this.props.location.coords &&
            <MyLocationMapMarker
              coordinate={this.props.coords}
              gpsHeading={this.props.coords.heading}
              compassHeading={this.props.compass.heading}
            /> }
          {this.props.location.enabled && this.renderUsersAround()}
        </MapView>
        {this.props.location.enabled && this.props.location.coords &&
          <Text style={styles.debugText}>
            Accuracy: {Math.floor(this.props.coords.accuracy)}{'\n'}
            GPS Heading: {this.props.coords.heading}{'\n'}
            Compass Heading: {this.props.compass.heading}{'\n'}
            GeoUpdates: {this.props.geoUpdates}{'\n'}
            UID: {this.props.auth.uid && this.props.auth.uid.substring(0, 4)}{'\n'}
          </Text>
        }
      </View>

    );
  }
}

const styles = StyleSheet.create({
  mapView: {
    flex: 1,
    zIndex: -1,
  },
  makerCallout: {
    width: 150,
  },
  debugText: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
    opacity: 0.8,
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(DaterMapView);
