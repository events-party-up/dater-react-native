import * as React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { Dispatch } from 'react-redux';

import { GeoCoordinates } from '../../types';
import CircleButton from '../ui-kit/circle-button';
import { Actions } from '../../navigators/navigator-actions';
import { MAP_PLUS_MINUS_ZOOM_INCREMENT, SCREEN_HEIGHT } from '../../constants';

const myLocationIcon = require('../../assets/icons/my-location/48/my-location.png');
const playIcon = require('../../assets/icons/play/play.png');
const stopIcon = require('../../assets/icons/stop/stop.png');
const myProfileIcon = require('../../assets/icons/my-profile/my-profile.png');
const plusIcon = require('../../assets/icons/plus/plus.png');
const minusIcon = require('../../assets/icons/minus/minus.png');

type Props = {
  dispatch: Dispatch,
  location: {
    coords: GeoCoordinates,
    enabled: boolean,
  },
  heading: number,
  microDateIsEnabled: boolean,
  isAuthenticated: boolean,
  mapViewZoom: number,
};

type State = {
  number: number,
}

class OnMapRightButtons extends React.Component<Props, State> {
  nextZoom; // need this to handle quick multiply touches of zoomIn/zoomOut
  timer;

  constructor() {
    super();
    this.timer = null;
    this.zoomInLongPress = this.zoomInLongPress.bind(this);
    this.stopTimer = this.stopTimer.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.mapViewZoom !== this.props.mapViewZoom) {
      this.nextZoom = nextProps.mapViewZoom; // reset nextZoom when MapView received updated zoom
    }
  }

  stopTimer = () => {
    clearTimeout(this.timer);
  }

  zoomIn = () => {
    this.props.dispatch({
      type: 'MAPVIEW_ZOOM_TO',
      payload: {
        zoom: this.nextZoom + MAP_PLUS_MINUS_ZOOM_INCREMENT,
      },
    });
    this.nextZoom = this.nextZoom + MAP_PLUS_MINUS_ZOOM_INCREMENT;
  }

  zoomInLongPress = () => {
    this.zoomIn();
    this.timer = setTimeout(this.zoomInLongPress, 200);
  }

  zoomOut = () => {
    this.props.dispatch({
      type: 'MAPVIEW_ZOOM_TO',
      payload: {
        zoom: this.nextZoom - MAP_PLUS_MINUS_ZOOM_INCREMENT,
      },
    });
    this.nextZoom = this.nextZoom - MAP_PLUS_MINUS_ZOOM_INCREMENT;
  }

  zoomOutLongPress = () => {
    this.zoomOut();
    this.timer = setTimeout(this.zoomOutLongPress, 200);
  }

  onMyProfilePress = () => {
    Actions.navigate({
      key: 'EditProfile',
      routeName: 'RegisterProfile',
      params: {
        navigationFlowType: 'mapViewModal',
      },
    });
  }

  centerMe = () => {
    if (this.props.location.enabled === true) {
      this.props.dispatch({
        type: 'MAPVIEW_SWITCH_VIEW_MODE_START',
        payload: {
          heading: this.props.heading,
        },
      });
    }
  }

  onGeoTogglePress = () => {
    if (this.props.location.enabled) {
      this.props.dispatch({
        type: 'GEO_LOCATION_STOP',
      });
    } else {
      this.props.dispatch({
        type: 'GEO_LOCATION_START_MANUALLY',
      });
    }
  }

  render() {
    return (
      <React.Fragment>
        <View style={styles.zoomInZoomOutContainer}>
          <CircleButton
            style={[styles.button, {
              opacity: 0.8,
              marginBottom: 16,
            }]}
            onPressIn={this.zoomInLongPress}
            onPressOut={this.stopTimer}
            image={plusIcon}
            size="medium"
          />
          <CircleButton
            style={[styles.button, {
              opacity: 0.8,
              marginBottom: 64,
            }]}
            onPressIn={this.zoomOutLongPress}
            onPressOut={this.stopTimer}
            image={minusIcon}
            size="medium"
          />
        </View>
        <View style={styles.buttonContainer}>
          {this.props.isAuthenticated &&
            <CircleButton
              style={[styles.button, { opacity: 0.8 }]}
              onPress={this.onMyProfilePress}
              image={myProfileIcon}
              size="medium"
            />
          }
          {!this.props.microDateIsEnabled &&
            <CircleButton
              style={styles.button}
              onPress={this.onGeoTogglePress}
              image={this.props.location.enabled ? stopIcon : playIcon}
              size="medium"
              disabled={!this.props.isAuthenticated}
            />
          }
          <CircleButton
            style={styles.button}
            onPress={this.centerMe}
            image={myLocationIcon}
            size="medium"
            disabled={!this.props.location.enabled}
          />
        </View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
  mapButton: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: 'rgba(255, 255, 253, 0.8)',
    borderColor: 'gray',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'black',
    shadowRadius: 8,
    shadowOpacity: 0,
    opacity: 0.6,
    margin: 5,
  },
  button: {
    opacity: 0.6,
    margin: 4,
  },
  zoomInZoomOutContainer: {
    position: 'absolute',
    top: SCREEN_HEIGHT / 3,
    right: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 30,
    right: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 1,
  },
});

export default OnMapRightButtons;
