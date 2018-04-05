import { StackNavigator } from 'react-navigation';

import {
  Main,
  TypographyContainer,
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
    Typography: {
      screen: TypographyContainer,
      title: 'Typography',
      headerMode: 'none',
    },
  },
  {
    headerMode: 'none',
    mode: 'modal',
    transitionConfig: () => ({ screenInterpolator: forVertical }),
    cardStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0)',
    },

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
