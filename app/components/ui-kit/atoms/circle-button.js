import * as React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

const closeIcon = require('../../../assets/icons/close/close.png');
const backIcon = require('../../../assets/icons/back/back.png');
const confirmCheckmarkIcon = require('../../../assets/icons/checkmark/checkmark-white.png');

type Props = {
  roundImage: boolean, // Should image be a a circle?
  size: 'smallest' | 'small' | 'medium-small' | 'medium' | 'medium-big' | 'large',
  type: 'close' | 'decline' | 'back' | 'confirm',
  style: typeof StyleSheet,
  onPress: (any) => void,
  onLongPress: (any) => void,
  onPressIn: (any) => void,
  onPressOut: (any) => void,
  image: any,
  disabled: any,
}

type State = {
  opacity: number,
  shadowColor: string,
  backgroundColor: string,
  image: any,
  width: number,
  height: number,
}

export default class CircleButton extends React.Component<Props, State> {
  styles;

  onPress = (event) => {
    if (this.props.onPress && !this.props.disabled) {
      this.props.onPress(event);
    }
  };

  onLongPress = (event) => {
    if (this.props.onLongPress && !this.props.disabled) {
      this.props.onLongPress(event);
    }
  };

  onPressIn = (event) => {
    if (this.props.onPressIn && !this.props.disabled) {
      this.props.onPressIn(event);
    }
  };

  onPressOut = (event) => {
    if (this.props.onPressOut && !this.props.disabled) {
      this.props.onPressOut(event);
    }
  };

  render() {
    const buttonProps = {
      ...circleButtonSetPropertiesFor(this.props.type),
      ...circleButtonGetDimensionsFor(this.props.size),
    };

    this.styles = StyleSheet.create({
      buttonContainer: {
        elevation: 1,
        backgroundColor: buttonProps.backgroundColor,
        width: buttonProps.width,
        height: buttonProps.height,
        borderRadius: buttonProps.width / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: buttonProps.shadowColor,
        shadowOpacity: 0.5,
        shadowRadius: 4,
        shadowOffset: {
          width: 0, height: 4,
        },
      },
      imageContainer: {
      },
      image: {
        opacity: this.props.disabled ? 0.5 : 1,
        borderRadius: this.props.roundImage ? buttonProps.width / 2 : 0,
      },
    });

    return (
      <TouchableOpacity
        style={[this.styles.buttonContainer, this.props.style]}
        activeOpacity={this.props.disabled ? 0.5 : 0.2}
        onPress={this.onPress}
        onLongPress={this.onLongPress}
        onPressIn={this.onPressIn}
        onPressOut={this.onPressOut}
        disabled={this.props.disabled}
        hitSlop={{
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        }}
      >
        <View style={this.styles.imageContainer} >
          <Image
            style={this.styles.image}
            source={this.props.image || buttonProps.image}
          />
        </View>
      </TouchableOpacity>
    );
  }
}

function circleButtonSetPropertiesFor(type) {
  switch (type) {
    case 'close': {
      return {
        backgroundColor: '#4F4F4F',
        shadowColor: '#4F4F4F',
        image: closeIcon,
      };
    }
    case 'decline': {
      return {
        backgroundColor: '#EB5757',
        shadowColor: '#4F4F4F',
        image: closeIcon,
      };
    }
    case 'back': {
      return {
        backgroundColor: '#fff',
        shadowColor: 'rgba(0, 0, 0, 0.21)',
        image: backIcon,
      };
    }
    case 'confirm': {
      return {
        backgroundColor: 'rgba(39, 174, 96, 0.9)',
        shadowColor: '#4F4F4F',
        image: confirmCheckmarkIcon,
      };
    }
    default:
      return {
        backgroundColor: '#fff',
        shadowColor: 'rgba(0, 0, 0, 0.11)',
      };
  }
}

function circleButtonGetDimensionsFor(size) {
  switch (size) {
    case 'smallest': {
      return {
        width: 16,
        height: 16,
      };
    }
    case 'small': {
      return {
        width: 24,
        height: 24,
      };
    }
    case 'medium-small': {
      return {
        width: 32,
        height: 32,
      };
    }
    case 'medium': {
      return {
        width: 48,
        height: 48,
      };
    }
    case 'medium-big': {
      return {
        width: 56,
        height: 56,
      };
    }
    case 'large': {
      return {
        width: 64,
        height: 64,
      };
    }
    default:
      return {
        width: 64,
        height: 64,
      };
  }
}
