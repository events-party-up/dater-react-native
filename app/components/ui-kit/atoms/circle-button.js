import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

const closeIcon = require('../../../assets/icons/close/close.png');
const backIcon = require('../../../assets/icons/back/back.png');
const confirmCheckmarkIcon = require('../../../assets/icons/checkmark/checkmark-white.png');

const CircleButton = (props) => {
  let backgroundColor = '#4F4F4F';
  let shadowColor = '#4F4F4F';
  let image;
  let width = 64;
  let height = 64;
  let opacity = 1;

  if (props.disabled === true) {
    opacity = 0.5;
  }

  switch (props.type) {
    case 'close': {
      shadowColor = '#4F4F4F';
      image = closeIcon;
      break;
    }
    case 'back': {
      backgroundColor = '#fff';
      shadowColor = 'rgba(0, 0, 0, 0.21)';
      image = backIcon;
      break;
    }
    case 'confirm': {
      backgroundColor = 'rgba(39, 174, 96, 0.9)';
      shadowColor = '#4F4F4F';
      image = confirmCheckmarkIcon;
      break;
    }
    default:
      backgroundColor = '#fff';
      shadowColor = 'rgba(0, 0, 0, 0.11)';
      image = props.image; // eslint-disable-line
      break;
  }

  switch (props.size) {
    case 'smallest': {
      width = 16;
      height = 16;
      break;
    }
    case 'small': {
      width = 24;
      height = 24;
      break;
    }
    case 'medium-small': {
      width = 32;
      height = 32;
      break;
    }
    case 'medium': {
      width = 48;
      height = 48;
      break;
    }
    case 'large': {
      width = 64;
      height = 64;
      break;
    }
    default:
      width = 64;
      height = 64;
      break;
  }

  const styles = StyleSheet.create({
    buttonContainer: {
      elevation: 1,
      backgroundColor,
      width,
      height,
      borderRadius: width / 2,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor,
      shadowOpacity: 0.5,
      shadowRadius: 4,
      shadowOffset: {
        width: 0, height: 4,
      },
      // padding: 4,
      // margin: 8,
    },
    imageContainer: {
    },
    image: {
      opacity,
    },
  });

  const onPress = (event) => {
    if (props.onPress && !props.disabled) {
      props.onPress(event);
    }
  };

  const onLongPress = (event) => {
    if (props.onPress && !props.disabled) {
      props.onLongPress(event);
    }
  };

  const onPressIn = (event) => {
    if (props.onPressIn && !props.disabled) {
      props.onPressIn(event);
    }
  };

  const onPressOut = (event) => {
    if (props.onPressOut && !props.disabled) {
      props.onPressOut(event);
    }
  };

  return (
    <TouchableOpacity
      style={[styles.buttonContainer, props.style]}
      activeOpacity={props.disabled ? opacity : 0.2}
      onPress={onPress}
      onLongPress={onLongPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      disabled={props.disabled}
      hitSlop={{
        top: 10,
        bottom: 10,
        left: 10,
        right: 10,
      }}
    >
      <View style={styles.imageContainer}>
        <Image
          style={styles.image}
          source={image}
        />
      </View>
    </TouchableOpacity>
  );
};

export default CircleButton;
