import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { connect, Dispatch } from 'react-redux';
import 'moment/locale/ru';

import MyLocationOnMovingMap from './map/my-location-on-moving-map';
import MyLocationMapMarker from './map/my-location-map-maker';
import PersonMaker from './map/person-maker';

import { GeoCompass, GeoCoordinates } from '../types';
import MapDirectionsComponent from '../components/map/map-directions-component';
import PastLocationMarker from '../components/map/past-location-marker';
import PastLocationPolylines from '../components/map/past-location-polylines';

const mapStateToProps = (state) => ({
  location: state.location,
  usersAround: state.usersAround,
  mapView: state.mapView,
  auth: state.auth,
  compass: state.compass,
  mapPanel: state.mapPanel,
});

function creatMapViewProxy(mapView: MapView) {
  return {
    animateToBearing: (bearing, duration) => mapView.animateToBearing(bearing, duration),
    animateToRegion: (region, duration) => mapView.animateToRegion(region, duration),
    animateToCoordinate: (coords, duration) => mapView.animateToCoordinate(coords, duration),
  };
}

type Props = {
  usersAround: {
    users: Array<mixed>,
  },
  auth: {
    uid: string,
  },
  compass: GeoCompass,
  dispatch: Dispatch,
  location: {
    coords: GeoCoordinates,
    geoUpdates: number,
    pastCoords: Array<GeoCoordinates>,
    moveHeadingAngle: number,
  },
  mapView: MapView,
  mapPanel: any,
};

class DaterMapView extends Component<Props> {
  mapView: MapView;
  directions: null;

  onRegionChangeComplete = async (newRegion, prevRegion) => {
    if (!prevRegion || !newRegion || !prevRegion.latitude) return;
    this.props.dispatch({
      type: 'MAPVIEW_REGION_UPDATED',
      payload: {
        newRegion,
        prevRegion,
      },
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'MAPVIEW_UNLOAD',
    });
  }

  onMapReady= () => {
    this.props.dispatch({
      type: 'MAPVIEW_READY',
      mapView: creatMapViewProxy(this.mapView),
    });
    this.props.dispatch({
      type: 'GEO_LOCATION_INITIALIZE',
    });
  }

  onPersonMakerPress = (user) => {
    if (this.props.mapPanel.visible) {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_REPLACE_START',
        payload: {
          mode: 'userCard',
          data: user,
        },
      });
    } else {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_SHOW_START',
        payload: {
          mode: 'userCard',
          data: user,
        },
      });
    }
  }

  onMapPressed = () => {
    if (this.props.mapPanel.visible) {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_HIDE_START',
      });
    }
  }

  onRegionChange = (region) => {
    console.log('Region updated');
    console.log(region);
  }

  renderUsersAround() {
    return this.props.usersAround.users.map((user) => (
      <Marker
        coordinate={{
          latitude: user.geoPoint.latitude,
          longitude: user.geoPoint.longitude,
        }}
        style={styles.maker}
        key={user.uid}
        onPress={(event) => { event.stopPropagation(); this.onPersonMakerPress(user); }}
      >
        <PersonMaker title={user.shortId} />
      </Marker>
    ));
  }

  onMapDragStart = (event) => {
    this.props.dispatch({
      type: 'MAPVIEW_DRAG_START',
      payload: event.nativeEvent,
    });
  }

  onMapDragEnd = (event) => {
    this.props.dispatch({
      type: 'MAPVIEW_DRAG_END',
      payload: event.nativeEvent,
    });
  }

  render() {
    return (
      <View
        style={styles.mapView}
        onMoveShouldSetResponder={(event) => {
          this.onMapDragStart(event);
          return true;
        }}
        onResponderRelease={this.onMapDragEnd}
      >
        {this.props.location.enabled && this.props.location.coords && this.props.mapView.centered &&
        <MyLocationOnMovingMap
          accuracy={this.props.location.coords.accuracy}
          visibleRadiusInMeters={this.props.mapView.visibleRadiusInMeters}
          moveHeadingAngle={this.props.location.moveHeadingAngle}
          mapViewBearingAngle={this.props.mapView.bearingAngle}
        />}
        <MapView
          ref={(component) => { this.mapView = component; }}
          style={styles.mapView}
          onRegionChangeComplete={(region) => this.onRegionChangeComplete(region, this.props.mapView)}
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
          onPress={() => { this.onMapPressed(); }}
        >
          {this.props.location.enabled && this.props.location.coords && !this.props.mapView.centered &&
            <MyLocationMapMarker
              accuracy={this.props.location.coords.accuracy}
              coordinate={this.props.location.coords}
              gpsHeading={this.props.location.coords.heading}
              compassHeading={this.props.compass.heading}
              moveHeadingAngle={this.props.location.moveHeadingAngle}
              mapViewBearingAngle={this.props.mapView.bearingAngle}
            /> }
          {this.props.location.enabled && this.renderUsersAround()}
          <MapDirectionsComponent />
          <PastLocationPolylines
            pastCoords={[...this.props.location.pastCoords, this.props.location.coords]}
          />
          <PastLocationMarker
            pastCoords={[...this.props.location.pastCoords, this.props.location.coords]}
            mapViewBearingAngle={this.props.mapView.bearingAngle}
          />
        </MapView>
        <Text style={styles.debugText}>
          Accuracy: {this.props.location.coords && Math.floor(this.props.location.coords.accuracy)}{'\n'}
          GPS Heading: {this.props.location.coords && this.props.location.coords.heading}{'\n'}
          Compass Heading: {this.props.compass.heading}{'\n'}
          GeoUpdates: {this.props.location && this.props.location.geoUpdates}{'\n'}
          UID: {this.props.auth.uid && this.props.auth.uid.substring(0, 4)}{'\n'}
        </Text>
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

export default connect(mapStateToProps)(DaterMapView);
