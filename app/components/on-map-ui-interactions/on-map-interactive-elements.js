import * as React from 'react';
import {
  View,
  Animated,
  Platform,
} from 'react-native';
import Interactable from 'react-native-interactable';
import { connect, Dispatch } from 'react-redux';

import MapPanelStyles from './map-panel-templates/map-panel-styles';
import OnMapButtons from './on-map-buttons';
import OnMapPanel from './on-map-panel';
import DeviceUtils from '../../utils/device-utils';
import { SCREEN_HEIGHT } from '../../constants';
import OnMapPanelButtons from './on-map-panel-buttons';

const STANDARD_MAP_PANEL_HEIGHT = (DeviceUtils.isiPhoneX() && 210) || (Platform.OS === 'ios' ? 175 : 205);
const HALF_SCREEN_MAP_PANEL_HEIGHT = SCREEN_HEIGHT / 2;

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
  animatedDeltaY: Animated.Value,
  activeMapPanelHeight: number,
  activeMapPanelPosition: number,
}

class OnMapInteractiveElements extends React.Component<Props, State> {
  interactableElement: Interactable.View;
  closedMapPanelPosition = SCREEN_HEIGHT;
  standardMapPanelPosition = SCREEN_HEIGHT - STANDARD_MAP_PANEL_HEIGHT;
  halfScreenMapPanelPosition = HALF_SCREEN_MAP_PANEL_HEIGHT;
  fullScreenMapPanelPosition = (DeviceUtils.isiPhoneX() && 32) || (Platform.OS === 'ios' ? 20 : 8);
  headerMapPanelPosition = this.closedMapPanelPosition - (DeviceUtils.isiPhoneX() ? 96 : 72);

  constructor(props) {
    super(props);
    this.state = {
      animatedDeltaY: new Animated.Value(this.closedMapPanelPosition),
      activeMapPanelPosition: this.standardMapPanelPosition,
      activeMapPanelHeight: STANDARD_MAP_PANEL_HEIGHT,
    };
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_READY',
      mapPanelSnapper: (args) => this.interactableElement.snapTo(args),
    });
    // this.state.animatedDeltaY.addListener(({ value }) => console.log(value));
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_UNLOAD',
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      activeMapPanelPosition: (nextProps.mapPanel.heightMode === 'halfScreen' && this.halfScreenMapPanelPosition) ||
        this.standardMapPanelPosition,
      activeMapPanelHeight: (nextProps.mapPanel.heightMode === 'halfScreen' && HALF_SCREEN_MAP_PANEL_HEIGHT) ||
        STANDARD_MAP_PANEL_HEIGHT,
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

  onPressHandle = () => {
  }

  render() {
    return (
      <View
        pointerEvents="box-none"
        style={MapPanelStyles.panelContainer}
      >
        <Animated.View
          style={{
            bottom: this.state.animatedDeltaY.interpolate({
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
          <OnMapButtons
            locationIsEnabled={this.props.locationIsEnabled}
            mapViewZoom={this.props.mapViewZoom}
            isAuthenticated={this.props.isAuthenticated}
            dispatch={this.props.dispatch}
            microDateIsEnabled={this.props.microDateIsEnabled}
          />
        </Animated.View>
        <View
          pointerEvents="box-none"
          style={MapPanelStyles.panelContainer}
        >
          <Interactable.View
            ref={(component) => { this.interactableElement = component; }}
            verticalOnly
            snapPoints={[
              { y: this.standardMapPanelPosition, id: 'showStandard' },
              { y: this.halfScreenMapPanelPosition, id: 'showHalfScreen' },
              { y: this.fullScreenMapPanelPosition, id: 'showFullScreen' },
              {
                y: this.headerMapPanelPosition, id: 'showHeader', damping: 0.7, tension: 200,
              },
              { y: this.closedMapPanelPosition, id: 'close' }, // close map panel snap point
            ]}
            boundaries={{ top: 0 }}
            initialPosition={{ y: this.closedMapPanelPosition }}
            animatedValueY={this.state.animatedDeltaY}
            onSnap={this.onSnap}
          >
            <OnMapPanel
              microDateIsEnabled={this.props.microDate.enabled}
              mapPanel={this.props.mapPanel}
              uploadPhotos={this.props.uploadPhotos}
              microDate={this.props.microDate}
              onPressHandle={this.onPressHandle}
            />
          </Interactable.View>
        </View>
        <OnMapPanelButtons
          panelButtonsAnimatedValue={this.state.animatedDeltaY.interpolate({
            inputRange: [
              0,
              this.state.activeMapPanelPosition,
              SCREEN_HEIGHT,
            ],
            outputRange: [
              (DeviceUtils.isiPhoneX() && 40) || 16,
              (DeviceUtils.isiPhoneX() && 40) || 16,
              -this.state.activeMapPanelHeight,
            ],
            extrapolate: 'clamp',
            useNativeDriver: true,
          })}
          dispatch={this.props.dispatch}
          navigation={this.props.navigation}
          mapPanel={this.props.mapPanel}
        />
      </View>
    );
  }
}

export default connect(mapStateToProps)(OnMapInteractiveElements);
