import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import Interactable from 'react-native-interactable';
import Moment from 'react-moment';
import { connect, Dispatch } from 'react-redux';

import { H2, Body } from '../../components/ui-kit/typography';
import DaterButton from '../../components/ui-kit/dater-button';

const mapStateToProps = (state) => ({
  mapPanel: state.mapPanel,
});

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
};

type Props = {
  mapPanel: any,
  dispatch: Dispatch,
};

class MapPanel extends Component<Props> {
  _deltaY: Animated.Value;
  panViewBottom: Animated.Value;
  interactableElement: Interactable.View;
  showSnapPosition = Platform.OS === 'ios' ? Screen.height - 100 : Screen.height - 130;

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
    // console.log('On Snap: ', event.nativeEvent);
    if (event && event.nativeEvent && event.nativeEvent.id === 'close_manual' && this.props.mapPanel.visible) {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_HIDE_START',
      });
    }
  };

  render() {
    return (
      <View
        style={styles.panelContainer}
        pointerEvents="box-none"
      >
        <Interactable.View
          ref={(component) => { this.interactableElement = component; }}
          verticalOnly
          snapPoints={
            [
              { y: this.showSnapPosition, id: 'show' }, // open card snap point
              { y: Screen.height + 80, id: 'close_manual' }, // close card snap point, manual
              { y: Screen.height + 195, id: 'close_auto' }, // close card snap point, auto
            ]}
          boundaries={{ top: -300 }}
          initialPosition={{ y: Screen.height + 80 }}
          animatedValueY={this._deltaY}
          onSnap={this.onSnap}
        >
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHandle} />
            </View>
            <H2>Ольга, 25 лет ({this.props.mapPanel.user.shortId} )</H2>
            <Body style={{
              marginBottom: 8,
              marginTop: 8,
            }}
            >
              {this.props.mapPanel.user.distance} метров от вас, {' '}
              <Moment locale="ru" element={Body} fromNow>{this.props.mapPanel.user.timestamp}</Moment>
            </Body>
            <DaterButton style={styles.panelButton}>
              Встретиться
            </DaterButton>
          </View>
        </Interactable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 4,
  },
  panel: {
    height: Screen.height + 300,
    padding: 20,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderRadius: 4,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowRadius: 4,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 0,
    },
    elevation: 1,
  },
  panelHeader: {
    alignItems: 'center',
  },
  panelHandle: {
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
  },
  panelButton: {
    alignItems: 'center',
    marginVertical: 8,
  },
  photo: {
    width: Screen.width - 40,
    height: 225,
    marginTop: 30,
  },
});

export default connect(mapStateToProps)(MapPanel);
