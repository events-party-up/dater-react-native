import * as React from 'react';
import { Animated } from 'react-native';

import { SCREEN_WIDTH } from '../../constants';

type Props = {
};

export default class SearchIsPendingAnimation extends React.Component<Props> {
  animationRadius1 = new Animated.Value(0);
  animationRadius2 = new Animated.Value(0);

  componentDidMount() {
    Animated.loop(Animated.timing(
      this.animationRadius1,
      {
        toValue: SCREEN_WIDTH / 2,
        duration: 5000,
      },
    )).start();

    setTimeout(() => {
      Animated.loop(Animated.timing(
        this.animationRadius2,
        {
          toValue: SCREEN_WIDTH / 2,
          duration: 5000,
        },
      )).start();
    }, 2500);
  }

  render() {
    return (
      [this.animationRadius1, this.animationRadius2].map((animatedValue, index) => (
        <Animated.View
          key={index} // eslint-disable-line
          style={{
            backgroundColor: animatedValue.interpolate({
              inputRange: [
                0, // for some reason this is often initial value
                SCREEN_WIDTH / 2,
              ],
              outputRange: [
                'rgba(61, 183, 112, 0.5)',
                'rgba(61, 183, 112, 0)',
              ],
              extrapolate: 'clamp',
              useNativeDriver: true,
            }),
            borderColor: 'rgba(61, 183, 112, 0.5)',
            borderWidth: 1,
            width: Animated.multiply(2, animatedValue),
            height: Animated.multiply(2, animatedValue),
            borderRadius: animatedValue,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
          }}
        />
      ))
    );
  }
}
