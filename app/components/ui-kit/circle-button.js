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
  let image = closeIcon;

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
      break;
  }

  const styles = StyleSheet.create({
    buttonContainer: {
      backgroundColor,
      shadowColor,
      width: 64,
      height: 64,
      borderRadius: 64 / 2,
      alignItems: 'center',
      justifyContent: 'center',
      shadowOpacity: 0.5,
      shadowRadius: 4,
      shadowOffset: {
        width: 0, height: 4,
      },
      padding: 4,
      margin: 8,
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
      style={styles.buttonContainer}
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

