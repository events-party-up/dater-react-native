import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import { H3, Body } from './typography';

const xpImage = require('../../assets/icons/xp/xp.png');
const coinImage = require('../../assets/icons/small-coin/small-coin.png');

const DaterButton = (props) => {
  let buttonTextColor = '#fff';
  let buttonBackgroundColor = '#000';
  let borderWidth = 0;
  let dividerBackgroundColor = 'rgba(242, 242, 242, 0.2)';

  switch (props.type) {
    case 'secondary': {
      buttonTextColor = '#000';
      buttonBackgroundColor = '#fff';
      borderWidth = 1;
      dividerBackgroundColor = 'rgba(0,0,0,0.05)';
      break;
    }
    case 'text': {
      buttonTextColor = '#000';
      buttonBackgroundColor = '#fff';
      borderWidth = 0;
      break;
    }
    default:
      break;
  }

  const styles = StyleSheet.create({
    buttonContainer: {
      width: 216,
      height: 48,
      backgroundColor: buttonBackgroundColor,
      borderRadius: 5,
      borderWidth,
    },
    textContainer: {
      flex: 1,
      justifyContent: (props.xpReward || props.coinReward) ? 'flex-start' : 'center',
      alignItems: 'center',
      flexDirection: 'row',
    },
    image: {
      marginRight: 4,
    },
    rewardContainer: {
      // flex: 0.3,
      // width: 84,
      justifyContent: 'center',
      flexDirection: 'row',
    },
    divider: {
      marginLeft: 16,
      marginRight: 16,
      // right: 16,
      width: 1,
      height: 28,
      backgroundColor: dividerBackgroundColor,
    },
    xpContainer: {
      alignItems: 'center',
      justifyContent: 'flex-start',
      flexDirection: 'row',
      marginLeft: 16,
    },
  });

  const onPress = () => {
    if (props.onPress) {
      props.onPress();
    }
  };

  return (
    <TouchableOpacity
      style={styles.buttonContainer}
      onPress={() => onPress()}
      hitSlop={{
      top: 10,
      bottom: 10,
      left: 10,
      right: 10,
    }}
    >
      <View style={styles.textContainer}>
        {props.xpReward && (
          <View style={styles.rewardContainer}>
            <View style={styles.xpContainer}>
              <Image
                style={styles.image}
                source={xpImage}
              />
              <Body color="#6FCF97">{props.xpReward}</Body>
            </View>
            <View style={styles.divider} />
          </View>)}
        {props.coinReward && (
          <View style={styles.rewardContainer}>
            <View style={styles.xpContainer}>
              <Image
                style={styles.image}
                source={coinImage}
              />
              <Body color={buttonTextColor}>{props.coinReward}</Body>
            </View>
            <View style={styles.divider} />
          </View>)}

        <H3 buttonText color={buttonTextColor} align="center">
          {props.children.toUpperCase()}
        </H3>
      </View>
    </TouchableOpacity>
  );
};

export default DaterButton;
