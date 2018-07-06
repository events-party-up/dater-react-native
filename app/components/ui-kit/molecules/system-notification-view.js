import * as React from 'react';

import {
  StyleSheet,
  Animated,
  Image,
} from 'react-native';

import { Body } from '../../../components/ui-kit/atoms/typography';
import { SCREEN_WIDTH } from '../../../constants';
import DeviceUtils from '../../../utils/device-utils';

const topVisibleOffset = (DeviceUtils.isiPhoneX() && 42) || 24;
const topHiddenOffset = -150;

type Props = {
  message: string,
  index: number,
  icon: any,
  timeToLive: number,
  type: 'temp' | 'permanent',
};

export default class SystemNotificationView extends React.Component<Props> {
  topAnimated = new Animated.Value(topHiddenOffset);

  componentDidMount() {
    Animated.spring(
      this.topAnimated,
      {
        toValue: topVisibleOffset + (this.props.index * 10),
        duration: 500,
        bounciness: 15,
      },
    ).start();
    if (this.props.type === 'temp') {
      setTimeout(() => {
        Animated.spring(
          this.topAnimated,
          {
            toValue: topHiddenOffset,
            duration: 500,
            bounciness: 15,
          },
        ).start();
      }, this.props.timeToLive);
    }
  }

  render() {
    return (
      <Animated.View
        style={[
          styles.container, {
            top: this.topAnimated,
          }]}
      >
        <Image source={this.props.icon} style={styles.icon} />
        <Body
          style={styles.message}
          numberOfLines={3}
          ellipsizeMode="tail"
        >
          {this.props.message}
        </Body>
      </Animated.View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    borderRadius: 32,
    width: SCREEN_WIDTH * 0.9,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    zIndex: 2,
  },
  icon: {
    marginLeft: 16,
    marginRight: 8,
  },
  message: {
    color: 'white',
    padding: 8,
    flex: 1,
  },
});
