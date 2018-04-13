import { StackNavigator } from 'react-navigation';
import LoginScreen from '../screens/login-screen';

const LoginNavigator = StackNavigator(
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

export default LoginNavigator;
