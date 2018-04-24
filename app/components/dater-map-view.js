import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import MapView from 'react-native-maps';
import { connect, Dispatch } from 'react-redux';

import { GeoCompass, GeoCoordinates } from '../types';
import MyLocationOnMovingMap from './map/my-location-on-moving-map';
import MyLocationMapMarker from './map/my-location-map-maker';
import UsersAroundComponent from './map/users-around-component';
import MapDirectionsComponent from './map/map-directions-component';
import PastLocationMarker from './map/past-location-marker';
import PastLocationPolylines from './map/past-location-polylines';
import { Caption2 } from './ui-kit/typography';

const mapStateToProps = (state) => ({
  location: state.location,
  mapView: state.mapView,
  auth: state.auth,
  compass: state.compass,
  mapPanel: state.mapPanel,
  findUser: state.findUser,
});

function creatMapViewProxy(mapView: MapView) {
  return {
    animateToBearing: (bearing, duration) => mapView.animateToBearing(bearing, duration),
    animateToRegion: (region, duration) => mapView.animateToRegion(region, duration),
    animateToCoordinate: (coords, duration) => mapView.animateToCoordinate(coords, duration),
    fitToCoordinates: (coords, options) => mapView.fitToCoordinates(coords, options),
  };
}

type Props = {
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
  findUser: any,
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
  }

  onMapPressed = () => {
    if (this.props.mapPanel.visible) {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_HIDE',
        payload: {
          source: 'onMapPressed',
        },
      });
    }
  }

  onRegionChange = (region) => {
    console.log('Region updated');
    console.log(region);
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
          <UsersAroundComponent />
          <MapDirectionsComponent />
          <PastLocationPolylines
            pastCoords={this.props.findUser.targetPastCoords}
            uid={this.props.findUser.targetUserUid}
            mode="target"
          />
          <PastLocationMarker
            pastCoords={this.props.findUser.targetPastCoords}
            mapViewBearingAngle={this.props.mapView.bearingAngle}
            uid={this.props.findUser.targetUserUid}
            mode="target"
          />
          <PastLocationPolylines
            pastCoords={this.props.findUser.myPastCoords}
            uid={this.props.auth.uid && this.props.auth.uid}
            mode="own"
          />
          <PastLocationMarker
            pastCoords={this.props.findUser.myPastCoords}
            mapViewBearingAngle={this.props.mapView.bearingAngle}
            uid={this.props.auth.uid && this.props.auth.uid}
            mode="own"
          />
        </MapView>
        <Caption2 style={styles.debugText} pointerEvents="none">
          Accuracy: {this.props.location.coords && Math.floor(this.props.location.coords.accuracy)}{'\n'}
          GPS Heading: {this.props.location.coords && this.props.location.coords.heading}{'\n'}
          Compass Heading: {this.props.compass.heading}{'\n'}
          GeoUpdates: {this.props.location && this.props.location.geoUpdates}{'\n'}
          UID: {this.props.auth.uid && this.props.auth.uid.substring(0, 4)}
        </Caption2>
        {this.props.findUser.enabled &&
        <View style={styles.findUserContainer} pointerEvents="none">
          <Caption2 style={styles.findUserText}>
            Distance: {this.props.findUser.currentDistance}{'\n'}
            My Score:
            {` ${this.props.findUser.myScore}`}{'\n'}
            {this.props.findUser.targetUserUid && this.props.findUser.targetUserUid.substring(0, 4)}:
            {` ${this.props.findUser.targetScore}`}
          </Caption2>
        </View>
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
  debugText: {
    opacity: 0.8,
    color: 'rgba(0, 0, 0, 0.9)',
    position: 'absolute',
    top: 40,
    left: 20,
  },
  findUserText: {
    opacity: 0.8,
    color: 'rgba(0, 0, 0, 0.9)',
  },
  findUserContainer: {
    opacity: 0.8,
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
    // margin: 8,
    flex: 1,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    shadowRadius: 16,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 4,
    },
    elevation: 1,
  },
});

export default connect(mapStateToProps)(DaterMapView);
