import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';

import { H3, Body } from './typography';

const DaterButton = (props) => {
  let buttonTextColor = '#fff';
  let buttonBackgroundColor = '#000';
  let borderWidth = 0;

  function onPressButton() {
    console.log('Button pressed');
  }

  switch (props.type) {
    case 'secondary': {
      buttonTextColor = '#000';
      buttonBackgroundColor = '#fff';
      borderWidth = 1;
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

  const style = StyleSheet.create({
    buttonContainer: {
      width: 216,
      height: 48,
      backgroundColor: buttonBackgroundColor,
      borderRadius: 5,
      borderWidth,
    },
    textContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <TouchableOpacity style={style.buttonContainer} onPress={onPressButton}>
      <View style={style.textContainer}>
        <H3 buttonText color={buttonTextColor} align="center">
          {props.children.toUpperCase()}
        </H3>
      </View>
    </TouchableOpacity>
  );
};

export default DaterButton;
