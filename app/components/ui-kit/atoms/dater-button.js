import React from 'react';
import {
  StyleSheet,
  View,
  TouchableHighlight,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as _ from 'lodash';

import { H3, Body } from '../atoms/typography';
import { BUTTONS_ONPRESS_THROTTLE_THRESHOLD } from '../../../constants';

const xpImage = require('../../../assets/icons/xp/xp.png');
const coinImage = require('../../../assets/icons/small-coin/small-coin.png');

type Props = {
  type: 'secondary' | 'text',
  xpReward: number,
  coinReward: number,
  leftIconImage: any,
  onPress: () => void,
  onDisabledPress: () => void,
  style: typeof StyleSheet,
  children: any,
  disabled: boolean,
  inProgress: boolean,
}

export default class DaterButton extends React.Component<Props> {
  onPressThrottled;
  buttonTextColor = '#fff';
  buttonBackgroundColor = '#000';
  underlayColor = 'gray';
  borderWidth = 0;
  dividerBackgroundColor = 'rgba(242, 242, 242, 0.3)'; // opacity 0.3 is for inactive button
  styles: any;
  opacity = 1;

  componentWillMount() {
    this.onPressThrottled = _.throttle(this.onPress, BUTTONS_ONPRESS_THROTTLE_THRESHOLD);

    if (this.props.disabled === true) {
      this.opacity = 0.5;
    }

    switch (this.props.type) {
      case 'secondary': {
        this.buttonTextColor = '#000';
        this.buttonBackgroundColor = '#fff';
        this.underlayColor = 'gray';
        this.borderWidth = 1;
        this.dividerBackgroundColor = 'rgba(0,0,0,0.05)';
        break;
      }
      case 'text': {
        this.buttonTextColor = '#000';
        this.buttonBackgroundColor = '#fff';
        this.borderWidth = 0;
        break;
      }
      default:
        break;
    }

    this.styles = StyleSheet.create({
      activityIndicator: {
        position: 'absolute',
        right: 8,
      },
      button: {
        width: 216,
        height: 48,
        backgroundColor: this.buttonBackgroundColor,
        borderRadius: 5,
        borderWidth: this.borderWidth,
        marginBottom: 8,
        flexDirection: 'row',
        opacity: this.opacity,
      },
      textContainer: {
        flex: 1,
        justifyContent: (this.props.xpReward || this.props.coinReward) ? 'flex-start' : 'center',
        alignItems: 'center',
        flexDirection: 'row',
      },
      image: {
        marginRight: 4,
      },
      rewardContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
      },
      divider: {
        marginLeft: 16,
        marginRight: 16,
        width: 1,
        height: 28,
        backgroundColor: this.dividerBackgroundColor,
      },
      xpContainer: {
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        marginLeft: 16,
      },
      leftIcon: {
        position: 'absolute',
        left: 16,
        width: 16,
        height: 16,
      },
    });
  }

  onPress = () => {
    if (this.props.onPress && !this.props.disabled) {
      this.props.onPress();
    } else if (this.props.onDisabledPress && this.props.disabled) {
      this.props.onDisabledPress();
    }
  };

  render() {
    return (
      <TouchableHighlight
        style={[{
          width: 216,
          height: 48,
          backgroundColor: this.buttonBackgroundColor,
          borderRadius: 5,
          borderWidth: this.borderWidth,
          marginBottom: 8,
          flexDirection: 'row',
          opacity: this.props.disabled ? 0.5 : 1,
        }, this.props.style]}
        onPress={this.onPressThrottled}
        underlayColor={this.props.disabled ? this.buttonBackgroundColor : this.underlayColor}
        activeOpacity={this.props.disabled ? this.opacity : 0.2}
        hitSlop={{
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        }}
      >
        <View style={this.styles.textContainer}>
          {this.props.leftIconImage &&
            <Image
              style={this.styles.leftIcon}
              source={this.props.leftIconImage}
            />
          }
          {this.props.xpReward && (
            <View style={this.styles.rewardContainer}>
              <View style={this.styles.xpContainer}>
                <Image
                  style={this.styles.image}
                  source={xpImage}
                />
                <Body color="#6FCF97">{this.props.xpReward}</Body>
              </View>
              <View style={this.styles.divider} />
            </View>)}
          {this.props.coinReward && (
            <View style={this.styles.rewardContainer}>
              <View style={this.styles.xpContainer}>
                <Image
                  style={this.styles.image}
                  source={coinImage}
                />
                <Body color={this.buttonTextColor}>{this.props.coinReward}</Body>
              </View>
              <View style={this.styles.divider} />
            </View>)}

          <H3 buttonText color={this.buttonTextColor} align="center">
            {_.upperCase(this.props.children)}
          </H3>
          {this.props.inProgress &&
            <ActivityIndicator
              style={this.styles.activityIndicator}
              color={this.props.type === 'secondary' ? 'gray' : 'white'}
            />
          }
        </View>
      </TouchableHighlight>
    );
  }
}

