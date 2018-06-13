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
import OnMapRightButtons from '../components/map/on-map-right-buttons';

const mapStateToProps = (state) => ({
  location: state.location,
  mapView: state.mapView,
  auth: state.auth,
  mapPanel: state.mapPanel,
  microDate: state.microDate,
  appState: state.appState.state,
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
    // will not honour duration if zoom is non-null!
    setCamera: (options) => mapView.setCamera({
      centerCoordinate: [options.longitude, options.latitude],
      heading: options.heading || undefined,
      zoom: options.zoom || undefined,
      duration: options.duration || undefined,
      mode: MapboxGL.CameraModes.Ease,
    }),
    // zoomTo: (...args) => mapView.zoomTo(...args), // DO NOT use this method, broken in MapBox React Native SDK
    moveTo: (...args) => mapView.moveTo(...args),
    fitBounds: (...args) => mapView.fitBounds(...args),
  };
}

type Props = {
  auth: {
    uid: string,
    isAuthenticated: boolean,
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

  componentDidUpdate() {
    if (this.mapView &&
      this.props.microDate.enabled &&
      this.props.appState === 'active'
    ) {
      this.mapView.setCamera({
        centerCoordinate: [this.props.location.coords.longitude, this.props.location.coords.latitude],
        heading: this.state.compassHeading || this.props.location.moveHeadingAngle,
        duration: 500,
        mode: MapboxGL.CameraModes.Ease,
      });
    }
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
        <OnMapRightButtons
          location={this.props.location}
          heading={this.state.compassHeading || this.props.location.moveHeadingAngle}
          dispatch={this.props.dispatch}
          isAuthenticated={this.props.auth.isAuthenticated}
          microDateIsEnabled={this.props.microDate.enabled}
          mapViewZoom={this.props.mapView.zoom}
        />
        {this.props.location.enabled && this.props.location.coords && this.props.mapView.centered &&
        <MyLocationOnCenteredMap
          accuracy={this.props.location.coords.accuracy}
          visibleRadiusInMeters={this.props.mapView.visibleRadiusInMeters}
          heading={this.state.compassHeading || this.props.location.moveHeadingAngle}
          headingToTarget={this.props.microDate.headingToTarget}
          microDateEnabled={this.props.microDate.enabled}
          mapViewHeadingAngle={this.props.mapView.heading}
          mapViewModeIsSwitching={this.props.mapView.modeIsSwitching}
        />}
        {this.props.appState !== 'background' && this.props.appState !== 'init' && true &&
          <MapboxGL.MapView
            ref={(component) => { this.mapView = component; }}
            showUserLocation={false}
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
            scrollEnabled={!this.props.microDate.enabled}
            // zoomEnabled={false}
            rotateEnabled={!this.props.microDate.enabled}
            pitchEnabled={false}
            minZoomLevel={9}
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
                mapViewModeIsSwitching={this.props.mapView.modeIsSwitching}
                headingToTarget={this.props.microDate.headingToTarget}
                microDateEnabled={this.props.microDate.enabled}
              />
            }
          </MapboxGL.MapView>
        }
        <View style={styles.debugView} pointerEvents="none">
          <Caption2 style={styles.debugText}>
            Точность: {this.props.location.coords && Math.floor(this.props.location.coords.accuracy)}{'\n'}
            GPS Heading: {this.props.location.coords && Math.floor(this.props.location.coords.heading)}{'\n'}
            Compass Heading: {Math.floor(this.state.compassHeading)}{'\n'}
            Move Heading: {Math.floor(this.props.location.moveHeadingAngle)}{'\n'}
            UID: {this.props.auth.uid && this.props.auth.uid.substring(0, 4)}
          </Caption2>
        </View>
        {this.props.microDate.enabled &&
        <View style={styles.microDateContainer} pointerEvents="none">
          <Caption2 style={styles.microDateText}>
            ID Встречи: {this.props.microDate.id.substring(0, 4)}{'\n'}
            Дистанция: {Math.floor(this.props.microDate.distance)}{'\n'}
            Мои Очки:{' '}
            <MicroDateStats
              microDateId={this.props.microDate.id}
              uid={this.props.auth.uid && this.props.auth.uid}
              style={styles.microDateText}
            />
            {'\n'}
            Оппонента: {' '}
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
