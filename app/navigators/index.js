import React from 'react';

import { StackNavigator } from 'react-navigation';

import {
  Main,
  TypographyScreen,
  DaterButtonsScreen,
  UIKitIndexScreen,
} from '../containers';

import LoginScreen from '../containers/login';
import { DaterHeader } from '../components';

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
    cardStyle: {
      backgroundColor: 'transparent',
    },
  },
);

const UIKitStack = StackNavigator(
  {
    UIKitIndex: {
      screen: UIKitIndexScreen,
      title: 'UI Kit Main',
      // navigationOptions: () => ({
      //   // header: <DaterHeader>UI Kit Collection</DaterHeader>,
      //   // header: (navigation, header) => (<DaterHeader>UI Kit Collection</DaterHeader>),
      //   headerTitle: <DaterHeader>UI Kit Collection</DaterHeader>,
      //   headerLeft: null,
      //   headerStyle: {
      //     backgroundColor: '#fff',
      //     borderWidth: 0,
      //     borderBottomWidth: 0,
      //   },
      //   titleStyle: {
      //     textAlign: 'left',
      //     alignSelf: 'flex-start',
      //     alignItems: 'flex-start',
      //     justifyContent: 'flex-start',
      //     flex: 1,
      //   },
      //   headerTitleStyle: {
      //     textAlign: 'left',
      //     flex: 1,
      //     alignSelf: 'flex-start',
      //     alignItems: 'flex-start',
      //     justifyContent: 'flex-start',
      //   },
      //   style: {
      //     textAlign: 'left',
      //     flex: 1,
      //     alignSelf: 'flex-start',
      //     alignItems: 'flex-start',
      //     justifyContent: 'flex-start',
      //   },
      // }),
    },
    Typography: {
      screen: TypographyScreen,
      headerMode: 'none',
      navigationOptions: {
        headerTitle: <DaterHeader>Typography</DaterHeader>,
        headerLeft: null,
      },
    },
    Buttons: {
      screen: DaterButtonsScreen,
      navigationOptions: {
        headerTitle: <DaterHeader>Buttons</DaterHeader>,
        headerLeft: null,
      },
    },
  },
  {
    headerMode: 'none',
    header: null,
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
