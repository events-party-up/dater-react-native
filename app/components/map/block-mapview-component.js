import * as React from 'react';
import {
  StyleSheet,
  View,
  // ActivityIndicator,
  Animated,
} from 'react-native';
import LottieView from 'lottie-react-native';

import { H2, H3 } from '../../components/ui-kit/atoms/typography';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../../constants';

type State = {
  animationProgress: any,
}

type Props = {
  appState: any,
};

export default class BlockMapViewComponent extends React.Component<Props, State> {
  animation;
  constructor(props) {
    super(props);
    this.state = {
      animationProgress: new Animated.Value(0),
    };
  }

  componentDidMount() {
    this.cycleAnimation();
  }

  cycleAnimation() {
    Animated.sequence([
      Animated.timing(this.state.animationProgress, {
        toValue: 1,
        duration: 4000,
      }),
      Animated.timing(this.state.animationProgress, {
        toValue: 0,
        duration: 4000,
      }),
    ]).start(() => {
      this.cycleAnimation();
    });
  }

  render() {
    return (
      <View style={styles.blockView}>
        <View style={styles.blockModal}>
          <H2>Плохой сигнал GPS ({Math.floor(this.props.appState.gpsAccuracy)})</H2>
          <H3>Выйди на открытую местность.</H3>
          <LottieView
            source={require('../../assets/lottie-animations/location-search.json')} // eslint-disable-line
            progress={this.state.animationProgress}
            style={styles.animation}
          />
          {/* <ActivityIndicator
            style={styles.acitityIndicator}
            size="large"
            color="gray"
          /> */}
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  blockView: {
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    // opacity: 0.7,
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    zIndex: 10000,
    backgroundColor: 'rgba(128, 128, 128, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  acitityIndicator: {
    top: 0,
    bottom: 0,
    flex: 1,
  },
  blockModal: {
    zIndex: 10001,
    opacity: 1,
    padding: 16,
    left: 0,
    right: 0,
    width: SCREEN_WIDTH * 0.9,
    height: 150,
    justifyContent: 'flex-start',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: 'rgba(255,255,255,1)',
    borderRadius: 4,
    shadowRadius: 16,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 4,
    },
    elevation: 1,
  },
  animation: {
    left: 0,
    right: 0,
    bottom: 0,
    top: -10,
    // justifyContent: 'center',
    // alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    // width: 250,
    height: 250,
  },
});
