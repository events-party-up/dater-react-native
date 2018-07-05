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

  constructor(props) {
    super(props);
    this.state = {
      opacity: this.props.disabled ? 0.5 : 1,
      backgroundColor: '#4F4F4F',
      shadowColor: '#4F4F4F',
      image: this.props.image,
      width: 64,
      height: 64,
    };
  }

  componentWillMount() {
    this.setTypeProps(this.props.type);
    this.setSizeProps(this.props.size);
  }

  componentWillReceiveProps(nextProps) {
    this.setTypeProps(nextProps.type);
    this.setSizeProps(nextProps.size);
    this.setState({
      opacity: nextProps.disabled ? 0.5 : 1,
      image: nextProps.image,
    });
  }

  setTypeProps(type) {
    switch (type) {
      case 'close': {
        this.setState({
          shadowColor: '#4F4F4F',
          image: closeIcon,
        });
        break;
      }
      case 'decline': {
        this.setState({
          shadowColor: '#4F4F4F',
          backgroundColor: '#EB5757',
          image: closeIcon,
        });
        break;
      }
      case 'back': {
        this.setState({
          backgroundColor: '#fff',
          shadowColor: 'rgba(0, 0, 0, 0.21)',
          image: backIcon,
        });
        break;
      }
      case 'confirm': {
        this.setState({
          backgroundColor: 'rgba(39, 174, 96, 0.9)',
          shadowColor: '#4F4F4F',
          image: confirmCheckmarkIcon,
        });
        break;
      }
      default:
        this.setState({
          backgroundColor: '#fff',
          shadowColor: 'rgba(0, 0, 0, 0.11)',
          image: this.props.image, // eslint-disable-line
        });
        break;
    }
  }

  setSizeProps(size) {
    switch (size) {
      case 'smallest': {
        this.setState({
          width: 16,
          height: 16,
        });
        break;
      }
      case 'small': {
        this.setState({
          width: 24,
          height: 24,
        });
        break;
      }
      case 'medium-small': {
        this.setState({
          width: 32,
          height: 32,
        });
        break;
      }
      case 'medium': {
        this.setState({
          width: 48,
          height: 48,
        });
        break;
      }
      case 'medium-big': {
        this.setState({
          width: 56,
          height: 56,
        });
        break;
      }
      case 'large': {
        this.setState({
          width: 64,
          height: 64,
        });
        break;
      }
      default:
        this.setState({
          width: 64,
          height: 64,
        });
        break;
    }
  }

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
    this.styles = StyleSheet.create({
      buttonContainer: {
        elevation: 1,
        backgroundColor: this.state.backgroundColor,
        width: this.state.width,
        height: this.state.height,
        borderRadius: this.state.width / 2,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: this.state.shadowColor,
        shadowOpacity: 0.5,
        shadowRadius: 4,
        shadowOffset: {
          width: 0, height: 4,
        },
      },
      imageContainer: {
      },
      image: {
        opacity: this.state.opacity,
        borderRadius: this.props.roundImage ? this.state.width / 2 : 0,
      },
    });
    return (
      <TouchableOpacity
        style={[this.styles.buttonContainer, this.props.style]}
        activeOpacity={this.props.disabled ? this.state.opacity : 0.2}
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
            source={this.state.image}
          />
        </View>
      </TouchableOpacity>
    );
  }
}
