import * as React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { Dispatch } from 'react-redux';

import CircleButton from '../ui-kit/atoms/circle-button';
import { NavigatorActions } from '../../navigators/navigator-actions';
import {
  MAP_PLUS_MINUS_ZOOM_INCREMENT,
  MAP_MIN_ZOOM_LEVEL,
  MAP_MAX_ZOOM_LEVEL,
} from '../../constants';

const myLocationIcon = require('../../assets/icons/my-location/48/my-location.png');
const playIcon = require('../../assets/icons/play/play.png');
const stopIcon = require('../../assets/icons/stop/stop.png');
const myProfileIcon = require('../../assets/icons/my-profile/my-profile.png');
const plusIcon = require('../../assets/icons/plus/plus.png');
const minusIcon = require('../../assets/icons/minus/minus.png');

type Props = {
  dispatch: Dispatch,
  locationIsEnabled: boolean,
  microDateIsEnabled: boolean,
  isAuthenticated: boolean,
  mapViewZoom: number,
  heading: number,
};

type State = {
  number: number,
}

export default class OnMapButtons extends React.Component<Props, State> {
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
    if (this.nextZoom >= MAP_MAX_ZOOM_LEVEL) {
      this.nextZoom = MAP_MAX_ZOOM_LEVEL;
    }
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
    if (this.nextZoom <= MAP_MIN_ZOOM_LEVEL) {
      this.nextZoom = MAP_MIN_ZOOM_LEVEL;
    }
  }

  zoomOutLongPress = () => {
    this.zoomOut();
    this.timer = setTimeout(this.zoomOutLongPress, 200);
  }

  onMyProfilePress = () => {
    NavigatorActions.navigate({
      key: 'EditProfile',
      routeName: 'ProfileScreen',
      params: {
        navigationFlowType: 'mapViewModal',
      },
    });
  }

  centerMe = () => {
    if (this.props.microDateIsEnabled) { // two modes of operation, center me or zoom in zoom out
      this.props.dispatch({
        type: 'MAPVIEW_SWITCH_VIEW_MODE_START',
      });
    } else {
      this.props.dispatch({
        type: 'MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME',
        payload: {
          heading: this.props.heading,
        },
      });
    }
  }

  onGeoTogglePress = () => {
    if (this.props.locationIsEnabled) {
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
      <View style={styles.buttonsContainer}>
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
            image={this.props.locationIsEnabled ? stopIcon : playIcon}
            size="medium"
            disabled={!this.props.isAuthenticated}
          />
        }
        <CircleButton
          style={styles.button}
          onPress={this.centerMe}
          image={myLocationIcon}
          size="medium"
          disabled={!this.props.locationIsEnabled}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  text: {
    color: 'white',
  },
  button: {
    opacity: 0.6,
    margin: 4,
  },
  buttonsContainer: {
    flex: 1,
    right: 10,
    backgroundColor: 'transparent',
    alignItems: 'center',
    zIndex: 1,
  },
});
