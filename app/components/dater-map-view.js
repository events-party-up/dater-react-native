import * as React from 'react';
import {
  StyleSheet,
  View,
  NativeEventEmitter,
} from 'react-native';
import { connect, Dispatch } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
// import { PanGestureHandler } from 'react-native-gesture-handler';
import ReactNativeHeading from '@zsajjad/react-native-heading';

import { GeoCoordinates } from '../types';
import MyLocationOnCenteredMap from './map/my-location-on-centered-map';
import UsersAroundComponent from './map/users-around-component';
import PastLocationsPath from './map/past-locations-path';
import { Caption2 } from './ui-kit/typography';
import MicroDateStats from './micro-date/micro-date-stats';
import { MAX_VISIBLE_PAST_LOCATIONS } from '../constants';
import MyLocationOnNonCenteredMap from './map/my-location-on-non-centered-map';

const mapStateToProps = (state) => ({
  location: state.location,
  mapView: state.mapView,
  auth: state.auth,
  compass: state.compass,
  mapPanel: state.mapPanel,
  microDate: state.microDate,
});

function creatMapViewProxy(mapView: MapboxGL.MapView) {
  // modes: ['Flight', 'Ease', 'None']
  // duration must be > 0 to have effect

  return {
    animateToHeading: (heading, duration) => mapView.setCamera({
      heading,
      duration,
      mode: MapboxGL.CameraModes.Ease,
    }),
    setCamera: (options) => mapView.setCamera({
      centerCoordinate: [options.longitude, options.latitude],
      heading: options.heading,
      zoom: options.zoom,
      duration: options.duration,
      mode: MapboxGL.CameraModes.Ease,
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
    enabled: boolean,
    coords: GeoCoordinates,
    geoUpdates: number,
    pastCoords: Array<GeoCoordinates>,
    moveHeadingAngle: number,
  },
  mapView: MapboxGL.MapView,
  microDate: any,
};

type State = {
  compassHeading: number,
}

class DaterMapView extends React.Component<Props, State> {
  mapView: MapboxGL.MapView;
  defZoomLevel = 17;
  compassListener;

  constructor(props) {
    super(props);
    this.state = {
      compassHeading: 0,
    };
  }

  componentWillMount() {
    this.compassListener = new NativeEventEmitter(ReactNativeHeading);
    this.compassListener.addListener('headingUpdated', this.onCompassHeadingUpdated);
  }

  componentWillUnmount() {
    this.compassListener.removeAllListeners('headingUpdated');
    this.props.dispatch({
      type: 'MAPVIEW_UNLOAD',
    });
  }

  onCompassHeadingUpdated = (compassHeading) => {
    this.setState({
      compassHeading,
    });
  };

  onRegionDidChange = (event) => {
    // console.log('onRegionDidChange: ', event);
    this.props.dispatch({
      type: 'MAPVIEW_REGION_CHANGED',
      payload: event,
    });
  }

  onRegionWillChange = (event) => {
    // console.log('onRegionWillChange: ', event);
    // the only way to tell if it's user guesture because isUserInteraction always says false
    if (event.properties.animated === false) {
      this.props.dispatch({
        type: 'MAPVIEW_DRAG_START',
      });
    }
  }

  onMapReady= () => {
    this.props.dispatch({
      type: 'MAPVIEW_READY',
      mapView: creatMapViewProxy(this.mapView),
    });
  }

  onMapPressed = () => {
    this.props.dispatch({
      type: 'MAPVIEW_PRESSED',
    });
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
      // <PanGestureHandler
      //   // style={styles.mapViewContainer}
      //   onGestureEvent={this.onGestureEvent}
      //   id="dragbox"
      //   enabled
      // >
      <View
        style={styles.mapViewContainer}
        // onMoveShouldSetResponder={(event) => {
        //   this.onMapDragStart(event);
        //   return true;
        // }}
        // onResponderRelease={this.onMapDragEnd}
      >
        {this.props.location.enabled && this.props.location.coords && this.props.mapView.centered &&
        <MyLocationOnCenteredMap
          accuracy={this.props.location.coords.accuracy}
          visibleRadiusInMeters={this.props.mapView.visibleRadiusInMeters}
          // heading={this.props.location.moveHeadingAngle}
          // mapViewheadingAngle={this.props.mapView.headingAngle}
        />}
        <MapboxGL.MapView
          ref={(component) => { this.mapView = component; }}
          // showUserLocation={!this.props.mapView.centered && this.props.location.enabled}
          showUserLocation={false}
          // showUserLocation
          userTrackingMode={0}
          zoomLevel={17}
          style={styles.mapView}
          animated
          logoEnabled={false}
          compassEnabled={false}
          localizeLabels
          onPress={() => { this.onMapPressed(); }}
          pitch={0}
          onWillStartLoadingMap={this.onMapReady}
          styleURL="mapbox://styles/olegwn/cjggmap8l002u2rmu63wda2nk"
          onRegionDidChange={(event) => this.onRegionDidChange(event)}
          onRegionWillChange={(event) => this.onRegionWillChange(event)}
          // scrollEnabled={false}
          // zoomEnabled={false}
          // rotateEnabled={false}
          pitchEnabled={false}
          minZoomLevel={11}
          maxZoomLevel={18}
        >
          {this.props.microDate.enabled &&
            <PastLocationsPath
              lastLocation={this.props.location.coords}
              uid={this.props.auth && this.props.auth.uid}
              mode="own"
              microDateId={this.props.microDate.id}
              limit={MAX_VISIBLE_PAST_LOCATIONS}
            />
          }
          {this.props.microDate.enabled &&
          <PastLocationsPath
            lastLocation={this.props.microDate.targetCurrentCoords}
            uid={this.props.microDate.targetUserUid}
            mode="target"
            microDateId={this.props.microDate.id}
            limit={MAX_VISIBLE_PAST_LOCATIONS}
          />
        }
          <UsersAroundComponent />
          {this.props.location.coords && !this.props.mapView.centered &&
            <MyLocationOnNonCenteredMap
              compassHeading={this.state.compassHeading}
              moveHeadingAngle={this.props.location.moveHeadingAngle}
              mapViewHeadingAngle={this.props.mapView.heading}
              coords={this.props.location.coords}
            />
          }
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
        {this.props.microDate.enabled &&
        <View style={styles.microDateContainer} pointerEvents="none">
          <Caption2 style={styles.microDateText}>
            Date ID: {this.props.microDate.id.substring(0, 4)}{'\n'}
            Distance: {Math.floor(this.props.microDate.distance)}{'\n'}
            My Score:{' '}
            <MicroDateStats
              microDateId={this.props.microDate.id}
              uid={this.props.auth.uid && this.props.auth.uid}
              style={styles.microDateText}
            />
            {'\n'}
            {this.props.microDate.targetUserUid && this.props.microDate.targetUserUid.substring(0, 4)}: {' '}
            <MicroDateStats
              microDateId={this.props.microDate.id}
              uid={this.props.microDate.targetUserUid}
              style={styles.microDateText}
            />
          </Caption2>
        </View>
        }
      </View>
      // </PanGestureHandler>
    );
  }
}

const styles = StyleSheet.create({
  mapViewContainer: {
    flex: 1,
  },
  mapView: {
    flex: 1,
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
  microDateText: {
    opacity: 0.8,
    color: 'rgba(0, 0, 0, 0.9)',
  },
  microDateContainer: {
    opacity: 0.8,
    position: 'absolute',
    top: 40,
    right: 20,
    padding: 8,
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
