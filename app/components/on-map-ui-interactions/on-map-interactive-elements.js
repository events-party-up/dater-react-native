import * as React from 'react';
import {
  View,
  Animated,
  Platform,
} from 'react-native';
import Interactable from 'react-native-interactable';
import 'moment/locale/ru';
import { connect, Dispatch } from 'react-redux';

import MapPanelStyles from './map-panel-components/map-panel-styles';
import OnRightFloatingButtons from '../on-map-ui-interactions/on-right-floating-buttons';
import OnMapPanel from './on-map-panel';
import DeviceUtils from '../../utils/device-utils';
import { SCREEN_HEIGHT } from '../../constants';

const STANDARD_MAP_PANEL_HEIGHT = (DeviceUtils.isiPhoneX() && 190) || (Platform.OS === 'ios' ? 175 : 205);

const mapStateToProps = (state) => ({
  mapPanel: state.mapPanel,
  uploadPhotos: state.uploadPhotos,
  microDate: state.microDate,
});

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
  closedMapPanelPosition = SCREEN_HEIGHT;
  standardMapPanelPosition = SCREEN_HEIGHT - STANDARD_MAP_PANEL_HEIGHT;
  halfScreenMapPanelPosition = SCREEN_HEIGHT / 2;
  fullScreenMapPanelPosition = (DeviceUtils.isiPhoneX() && 32) || (Platform.OS === 'ios' ? 20 : 8);
  headerMapPanelPosition = this.closedMapPanelPosition - (DeviceUtils.isiPhoneX() ? 65 : 55);

  constructor(props) {
    super(props);
    this.state = {
      deltaHeight: new Animated.Value(this.closedMapPanelPosition),
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
    if (!event || !event.nativeEvent) return;

    if (event.nativeEvent.id === 'close') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_SNAPPED' });
    } else if (event.nativeEvent.id === 'showStandard') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_SHOW_SNAPPED' });
    } else if (event.nativeEvent.id === 'showHalfScreen') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_SHOW_HALF_SCREEN_SNAPPED' });
    }
  }

  render() {
    return (
      <React.Fragment>
        <Animated.View
          style={{
            bottom: this.state.deltaHeight.interpolate({
              inputRange: [
                0, // for some reason this is often initial value
                1,
                this.closedMapPanelPosition - STANDARD_MAP_PANEL_HEIGHT,
                this.closedMapPanelPosition,
              ],
              outputRange: [
                32, // padding panel closed for 0 value
                STANDARD_MAP_PANEL_HEIGHT + 8, // padding panel opened
                STANDARD_MAP_PANEL_HEIGHT + 8,
                32,
              ],
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
              { y: this.standardMapPanelPosition, id: 'showStandard' },
              { y: this.halfScreenMapPanelPosition, id: 'showHalfScreen' },
              { y: this.fullScreenMapPanelPosition, id: 'showFullScreen' },
              { y: this.headerMapPanelPosition, id: 'showHeader' }, // close map panel snap point
              { y: this.closedMapPanelPosition, id: 'close' }, // close map panel snap point
            ]}
            boundaries={{ top: -300 }}
            initialPosition={{ y: this.closedMapPanelPosition }}
            animatedValueY={this.state.deltaHeight}
            onSnap={this.onSnap}
          >
            <OnMapPanel
              navigation={this.props.navigation}
              microDateIsEnabled={this.props.microDate.enabled}
              mapPanel={this.props.mapPanel}
              uploadPhotos={this.props.uploadPhotos}
              microDate={this.props.microDate}
              dispatch={this.props.dispatch}
            />
          </Interactable.View>
        </View>
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps)(OnMapInteractiveElements);
