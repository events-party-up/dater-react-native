import { StackNavigator } from 'react-navigation';

import {
  Main,
  TypographyScreen,
  DaterButtonsScreen,
  UIKitIndexScreen,
} from '../containers';

import LoginScreen from '../containers/login';

const MainStack = StackNavigator(
  {
    Home: {
      screen: Main,
      title: 'Main Screen',
      headerMode: 'none',
      header: null,
    },
  },
  {
    initialRouteName: 'Home',
    headerMode: 'none',
  },
);

const UIKitStack = StackNavigator(
  {
    UIKitIndex: {
      screen: UIKitIndexScreen,
      title: 'UI Kit Main',
      headerMode: 'none',
    },
    Typography: {
      screen: TypographyScreen,
      title: 'Typography',
      headerMode: 'none',
    },
    Buttons: {
      screen: DaterButtonsScreen,
      title: 'Buttons',
      headerMode: 'none',
    },
  },
  {
    headerMode: 'none',
    initialRouteName: 'UIKitIndex',
    // hack to make transparent background on iOS
    // see https://github.com/react-navigation/react-navigation/issues/2713
    transitionConfig: () => ({
      containerStyle: {
      },
    }),
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
);

const RootStack = StackNavigator(
  {
    Home: {
      screen: MainStack,
      title: 'Main Screen',
      headerMode: 'none',
      header: null,
    },
    Login: {
      screen: LoginScreen,
      title: 'Login Screen',
      headerMode: 'none',
    },
    UIKit: {
      screen: UIKitStack,
      title: 'UI Kit',
      headerMode: 'none',
      header: null,
    },
  },
  {
    mode: 'modal',
    initialRouteName: 'Home',
    headerMode: 'none',
    cardStyle: {
      backgroundColor: 'transparent',
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
