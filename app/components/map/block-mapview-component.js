import * as React from 'react';
import {
  StyleSheet,
  View,
  // ActivityIndicator,
  Animated,
} from 'react-native';
import LottieView from 'lottie-react-native';

import { H2, Body } from '../../components/ui-kit/atoms/typography';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../../constants';

type State = {
  animationProgress: any,
  active: boolean,
}

type Props = {
  gpsIsPoor: boolean,
  gpsAccuracy: number,
};

export default class BlockMapViewComponent extends React.Component<Props, State> {
  animation;
  constructor(props) {
    super(props);
    this.state = {
      animationProgress: new Animated.Value(0),
      active: false,
    };
  }

  componentDidMount() {
    this.animation = Animated.loop(Animated.sequence([
      Animated.timing(this.state.animationProgress, {
        toValue: 1,
        duration: 4000,
      }),
      Animated.timing(this.state.animationProgress, {
        toValue: 0,
        duration: 4000,
      }),
    ]));
  }

  componentWillUnmount() {
    this.animation.stop();
    this.setInActive();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.gpsIsPoor && !this.state.active) {
      this.setActive();
    } else if (!nextProps.gpsIsPoor) {
      this.setInActive();
    }
  }

  setInActive() {
    this.setState({
      active: false,
    });
    this.animation.stop();
    this.animation.reset();
  }

  setActive() {
    this.animation.start();
    this.setState({
      active: true,
    });
  }

  badGpsSignal() {
    return (
      <React.Fragment>
        <H2
          style={{
            marginBottom: 12,
          }}
        >
          Плохой сигнал GPS ({this.props.gpsAccuracy})...
        </H2>
        <Body>Выйди на открытую местность.</Body>
        <LottieView
          source={require('../../assets/lottie-animations/location-search.json')} // eslint-disable-line
          progress={this.state.animationProgress}
          style={styles.animation}
        />
      </React.Fragment>
    );
  }

  render() {
    return this.state.active ? (
      <View style={styles.blockView}>
        <View style={styles.blockModal}>
          {this.badGpsSignal()}
          {/* <ActivityIndicator
            style={styles.acitityIndicator}
            size="large"
            color="gray"
          /> */}
        </View>
      </View>
    ) : null;
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
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    height: 250,
  },
});
