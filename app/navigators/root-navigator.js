import { StackNavigator } from 'react-navigation';

import MainScreen from '../screens/main-screen';
import UIKitNavigator from './ui-kit-navigator';
import LoginNavigator from './login-navigator';
import FloatingNavigator from './floating-navigator';
import MakePhotoSelfieScreen from '../screens/make-photo-selfie-screen';
import MicroDateScreen from '../screens/micro-date-screen';
import FullscreenPhotoScreen from '../screens/fullscreen-photo-screen';

const RootStack = StackNavigator(
  {
    MainScreen: {
      screen: MainScreen,
    },
    MakePhotoSelfieScreen: {
      screen: MakePhotoSelfieScreen,
    },
    MicroDateScreen: {
      screen: MicroDateScreen,
    },
    FullscreenPhotoScreen: {
      screen: FullscreenPhotoScreen,
    },
    LoginNavigator: {
      screen: LoginNavigator,
    },
    FloatingNavigator: {
      screen: FloatingNavigator,
    },
    UIKitNavigator: {
      screen: UIKitNavigator,
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'MainScreen',
    headerMode: 'none',
    header: null,
    cardStyle: {
      backgroundColor: 'transparent',
      shadowOpacity: 0,
    },
    transitionConfig: () => ({ screenInterpolator: forVertical }),
  },
);

function forVertical(props) {
  const { layout, position, scene } = props;

  const { index } = scene;
  const height = layout.initHeight;

  const translateX = 0;
  const translateY = position.interpolate({
    inputRange: ([index - 1, index, index + 1]: Array<number>),
    outputRange: ([height, 0, 0]: Array<number>),
  });

  return {
    transform: [{ translateX }, { translateY }],
  };
}

export default RootStack;
