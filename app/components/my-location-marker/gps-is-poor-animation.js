import * as React from 'react';
import { Animated } from 'react-native';

type Props = {
};

export default class GpsIsPoorAnimation extends React.Component<Props> {
  poorGpsRadius = new Animated.Value(0);

  componentDidMount() {
    Animated.loop(Animated.sequence([
      Animated.timing(this.poorGpsRadius, {
        toValue: 60,
        duration: 1000,
      }),
      Animated.timing(this.poorGpsRadius, {
        toValue: 10,
        duration: 1000,
      }),
      Animated.timing(this.poorGpsRadius, {
        toValue: 60,
        duration: 1000,
      }),
      Animated.timing(this.poorGpsRadius, {
        toValue: 10,
        duration: 1000,
      }),
      Animated.delay(3000),
    ])).start();
  }

  render() {
    return (
      <Animated.View style={{
        backgroundColor: 'rgba(235, 87, 87, 0.4)',
        width: Animated.multiply(2, this.poorGpsRadius),
        height: Animated.multiply(2, this.poorGpsRadius),
        borderRadius: this.poorGpsRadius,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
      }}
      />
    );
  }
}
