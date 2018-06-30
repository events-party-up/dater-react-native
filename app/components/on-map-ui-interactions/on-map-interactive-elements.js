import * as React from 'react';
import {
  View,
  Animated,
  Platform,
} from 'react-native';
import Interactable from 'react-native-interactable';
import 'moment/locale/ru';
import { connect, Dispatch } from 'react-redux';

import MapPanelStyles from './map-panel/map-panel-styles';

import OnRightFloatingButtons from '../on-map-ui-interactions/on-right-floating-buttons';
import MapPanelComponent from './map-panel/map-panel-component';

import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../../constants';

const mapStateToProps = (state) => ({
  mapPanel: state.mapPanel,
  uploadPhotos: state.uploadPhotos,
  microDate: state.microDate,
});

const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT - 75,
};

type Props = {
  mapPanel: any,
  microDate: any,
  dispatch: Dispatch,
  navigation: any,
  uploadPhotos: any,
  isAuthenticated: boolean,
  dispatch: Dispatch,
  locationIsEnabled: boolean,
  microDateIsEnabled: boolean,
  mapViewZoom: number,
  navigation: any,
};

type State = {
  deltaHeight: Animated.Value
}

class OnMapInteractiveElements extends React.Component<Props, State> {
  interactableElement: Interactable.View;
  showSnapPosition = Platform.OS === 'ios' ? Screen.height - 100 : Screen.height - 130;
  showFullScreenSnapPosition = Platform.OS === 'ios' ? 20 : 8;
  showHalfScreenSnapPosition = (Screen.height / 2) + 50;
  closeSnapPosition = SCREEN_HEIGHT + 80;

  constructor(props) {
    super(props);
    this.state = {
      deltaHeight: new Animated.Value(this.closeSnapPosition),
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_READY',
      mapPanelSnapper: (args) => this.interactableElement.snapTo(args),
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_UNLOAD',
    });
  }

  onSnap = (event) => {
    if (event && event.nativeEvent && event.nativeEvent.id === 'close') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_SNAPPED' });
    } else if (event && event.nativeEvent && event.nativeEvent.id === 'showStandard') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_SHOW_SNAPPED' });
    } else if (event && event.nativeEvent && event.nativeEvent.id === 'showHalfScreen') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_SHOW_HALF_SCREEN_SNAPPED' });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Animated.View
          style={{
            bottom: this.state.deltaHeight.interpolate({
              // first value is for initial 0 value
              inputRange: [0, 1, Screen.height - 120, this.closeSnapPosition],
              outputRange: [32, 16 + 200, 200, 16],
              extrapolate: 'clamp',
              useNativeDriver: true,
            }),
            right: 0,
            position: 'absolute',
            zIndex: 1,
          }}
        >
          <OnRightFloatingButtons
            locationIsEnabled={this.props.locationIsEnabled}
            mapViewZoom={this.props.mapViewZoom}
            isAuthenticated={this.props.isAuthenticated}
            dispatch={this.props.dispatch}
            microDateIsEnabled={this.props.microDateIsEnabled}
          />
        </Animated.View>
        <View
          style={MapPanelStyles.panelContainer}
          pointerEvents="box-none"
        >
          <Interactable.View
            ref={(component) => { this.interactableElement = component; }}
            verticalOnly
            snapPoints={[
              { y: this.showSnapPosition, id: 'showStandard' },
              { y: this.showHalfScreenSnapPosition, id: 'showHalfScreen' },
              { y: this.showFullScreenSnapPosition, id: 'showFullScreen' },
              { y: this.closeSnapPosition, id: 'close' }, // close map panel snap point
            ]}
            boundaries={{ top: -300 }}
            initialPosition={{ y: this.closeSnapPosition }}
            animatedValueY={this.state.deltaHeight}
            onSnap={this.onSnap}
          >
            <MapPanelComponent
              navigation={this.props.navigation}
              microDateIsEnabled={this.props.microDate.enabled}
              mapPanel={this.props.mapPanel}
              uploadPhotos={this.props.uploadPhotos}
              microDate={this.props.microDate}
            />
          </Interactable.View>
        </View>
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps)(OnMapInteractiveElements);
