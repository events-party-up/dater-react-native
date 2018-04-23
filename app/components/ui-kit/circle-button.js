import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

const closeIcon = require('../../assets/icons/close/close.png');
const backIcon = require('../../assets/icons/back/back.png');

const CircleButton = (props) => {
  let backgroundColor = '#4F4F4F';
  let shadowColor = '#4F4F4F';
  let image;
  let width = 64;
  let height = 64;

  switch (props.type) {
    case 'close': {
      shadowColor = '#4F4F4F';
      image = closeIcon;
      break;
    }
    case 'back': {
      backgroundColor = '#fff';
      shadowColor = 'rgba(0, 0, 0, 0.11)';
      image = backIcon;
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
    },
  });

  const onPress = () => {
    if (props.onPress) {
      props.onPress();
    }
  };

  return (
    <TouchableOpacity
      style={[styles.buttonContainer, props.style]}
      onPress={() => onPress()}
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

