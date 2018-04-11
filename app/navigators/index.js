import { StackNavigator } from 'react-navigation';

import {
  Main,
  TypographyScreen,
  DaterButtonsScreen,
  UIKitIndexScreen,
} from '../containers';

import LoginScreen from '../containers/login';

const LoginStack = StackNavigator(
  {
    Login: {
      screen: LoginScreen,
    },
  },
  {
    initialRouteName: 'Login',
    headerMode: 'none',
    transitionConfig: () => ({
      containerStyle: {
      },
    }),
    // hack to make transparent background on iOS
    // see https://github.com/react-navigation/react-navigation/issues/2713
    cardStyle: {
      backgroundColor: 'transparent',
      shadowOpacity: 0,
    },
  },
);

const UIKitStack = StackNavigator(
  {
    UIKitIndex: {
      screen: UIKitIndexScreen,
    },
    Typography: {
      screen: TypographyScreen,
      headerMode: 'none',
    },
    Buttons: {
      screen: DaterButtonsScreen,
    },
  },
  {
    headerMode: 'none',
    header: null,
    initialRouteName: 'UIKitIndex',
  },
);

const RootStack = StackNavigator(
  {
    Home: {
      screen: Main,
    },
    Login: {
      screen: LoginStack,
    },
    UIKit: {
      screen: UIKitStack,
      headerTitle: 'UI Kit Collection',
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'Home',
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
