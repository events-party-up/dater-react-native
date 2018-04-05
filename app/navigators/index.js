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
  },
);

export default RootStack;
