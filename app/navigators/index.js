import { StackNavigator } from 'react-navigation';

import {
  Main,
  TypographyContainer,
  DaterButtonsContainer,
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
      screen: TypographyContainer,
      title: 'Typography',
      headerMode: 'none',
    },
    Buttons: {
      screen: DaterButtonsContainer,
      title: 'Buttons',
      headerMode: 'none',
    },
  },
  {
    initialRouteName: 'UIKitIndex',
    headerMode: 'none',
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
