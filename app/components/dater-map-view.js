import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { connect, Dispatch } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import { GeoCoordinates } from '../types';
import MyLocationOnCenteredMap from './map/my-location-on-centered-map';
import UsersAroundComponent from './map/users-around-component';
import PastLocationsPath from './map/past-locations-path';
import { Caption2 } from './ui-kit/typography';

const mapStateToProps = (state) => ({
  location: state.location,
  mapView: state.mapView,
  auth: state.auth,
  compass: state.compass,
  mapPanel: state.mapPanel,
  findUser: state.findUser,
});

function creatMapViewProxy(mapView: MapboxGL.MapView) {
  return {
    animateToHeading: (heading, duration) => mapView.setCamera({
      heading,
      duration,
    }),
    setCamera: (options) => mapView.setCamera({
      centerCoordinate: [options.longitude, options.latitude],
      heading: options.heading,
      zoom: options.zoom,
      duration: 0,
    }),
    zoomTo: (...args) => mapView.zoomTo(...args),
    moveTo: (...args) => mapView.moveTo(...args),
    fitBounds: (...args) => mapView.fitBounds(...args),
  };
}

type Props = {
  auth: {
    uid: string,
  },
  dispatch: Dispatch,
  location: {
    coords: GeoCoordinates,
    geoUpdates: number,
    pastCoords: Array<GeoCoordinates>,
    moveHeadingAngle: number,
  },
  mapView: MapboxGL.MapView,
  mapPanel: any,
  findUser: any,
};

class DaterMapView extends Component<Props> {
  mapView: MapboxGL.MapView;
  directions: null;

  onRegionDidChange = (event) => {
    this.props.dispatch({
      type: 'MAPVIEW_REGION_CHANGED',
      payload: event,
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
    console.log('Map pressed');
    if (this.props.mapPanel.visible) {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_HIDE',
        payload: {
          source: 'onMapPressed',
        },
      });
    }
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
        style={styles.mapViewContainer}
        onMoveShouldSetResponder={(event) => {
          this.onMapDragStart(event);
          return true;
        }}
        onResponderRelease={this.onMapDragEnd}
      >
        {this.props.location.enabled && this.props.location.coords && this.props.mapView.centered &&
        <MyLocationOnCenteredMap
          accuracy={this.props.location.coords.accuracy}
          visibleRadiusInMeters={this.props.mapView.visibleRadiusInMeters}
          moveHeadingAngle={this.props.location.moveHeadingAngle}
          mapViewheadingAngle={this.props.mapView.headingAngle}
        />}
        <MapboxGL.MapView
          ref={(component) => { this.mapView = component; }}
          showUserLocation={!this.props.mapView.centered}
          zoomLevel={1}
          userTrackingMode={MapboxGL.UserTrackingModes.None}
          style={styles.mapView}
          // animated
          logoEnabled={false}
          compassEnabled={false}
          localizeLabels
          onPress={() => { this.onMapPressed(); }}
          pitch={0}
          pitchEnabled={false}
          onWillStartLoadingMap={this.onMapReady}
          styleURL="mapbox://styles/olegwn/cjggmap8l002u2rmu63wda2nk"
          onRegionDidChange={(event) => this.onRegionDidChange(event)}
          scrollEnabled
          minZoomLevel={11}
          maxZoomLevel={18}
        >
          <PastLocationsPath
            pastCoords={this.props.findUser.myPastCoords}
            mapViewheadingAngle={this.props.mapView.headingAngle}
            uid={this.props.auth.uid && this.props.auth.uid}
            mode="own"
          />
          <PastLocationsPath
            pastCoords={this.props.findUser.targetPastCoords}
            mapViewheadingAngle={this.props.mapView.headingAngle}
            uid={this.props.findUser.targetUserUid}
            mode="target"
          />
          <UsersAroundComponent />
        </MapboxGL.MapView>
        <View style={styles.debugView} pointerEvents="none">
          <Caption2 style={styles.debugText}>
            Accuracy: {this.props.location.coords && Math.floor(this.props.location.coords.accuracy)}{'\n'}
            GPS Heading: {this.props.location.coords && Math.floor(this.props.location.coords.heading)}{'\n'}
            Move Heading: {Math.floor(this.props.location.moveHeadingAngle)}{'\n'}
            {/* Compass Heading: {this.props.compass.heading}{'\n'} */}
            GeoUpdates: {this.props.location && this.props.location.geoUpdates}{'\n'}
            UID: {this.props.auth.uid && this.props.auth.uid.substring(0, 4)}
          </Caption2>
        </View>
        {this.props.findUser.enabled &&
        <View style={styles.findUserContainer} pointerEvents="none">
          <Caption2 style={styles.findUserText}>
            Distance: {Math.floor(this.props.findUser.currentDistance)}{'\n'}
            My Score:
            {` ${Math.floor(this.props.findUser.myScore)}`}{'\n'}
            {this.props.findUser.targetUserUid && this.props.findUser.targetUserUid.substring(0, 4)}:
            {` ${Math.floor(this.props.findUser.targetScore)}`}
          </Caption2>
        </View>
        }
      </View>

    );
  }
}

const styles = StyleSheet.create({
  mapViewContainer: {
    flex: 1,
  },
  mapView: {
    flex: 1,
    // zIndex: -1,
  },
  debugView: {
    position: 'absolute',
    top: 40,
    left: 20,
  },
  debugText: {
    opacity: 0.7,
    color: 'rgba(0, 0, 0, 0.9)',
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
