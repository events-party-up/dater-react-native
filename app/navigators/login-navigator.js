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
    header: null,
  },
);

export default LoginNavigator;
