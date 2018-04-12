import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Easing,
} from 'react-native';
import Interactable from 'react-native-interactable';

import { H2, Body } from '../../components/ui-kit/typography';
import DaterButton from '../../components/ui-kit/dater-button';

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
};

type Props = {

};

export default class MapPanel extends Component<Props> {
  _deltaY;
  panViewBottom: Animated.Value;

  constructor(props) {
    super(props);
    this._deltaY = new Animated.Value(Screen.height - 100);
    this.panViewBottom = new Animated.Value(150 - Screen.height);
  }

  showPanel = () => {
    Animated.timing(
      this.panViewBottom,
      {
        toValue: 350 - Screen.height,
        duration: 2000,
        easing: Easing.elastic(1), // Easing.inOut(Easing.quad)
      },
    ).start();
  }

  componentDidMount() {
    this.showPanel();
  }

  render() {
    return (
      <Animated.View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: this.panViewBottom,
          zIndex: 4,
        }}
        pointerEvents="box-none"
      >
        <Interactable.View
          verticalOnly
          snapPoints={[{ y: Screen.height - 100 }]}
          boundaries={{ top: -300 }}
          initialPosition={{ y: Screen.height - 100 }}
          animatedValueY={this._deltaY}
        >
          <View style={styles.panel}>
            <View style={styles.panelHeader}>
              <View style={styles.panelHandle} />
            </View>
            <H2>Девушка 25 лет</H2>
            <Body style={{
              marginBottom: 8,
              marginTop: 8,
            }}
            >
              International Airport - 40 miles away
            </Body>

            <DaterButton style={styles.panelButton}>
              Встретиться
            </DaterButton>
          </View>
        </Interactable.View>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
