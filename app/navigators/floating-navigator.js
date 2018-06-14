import { StackNavigator } from 'react-navigation';
import FloatingScreen from '../screens/floating-screen';

const FloatingNavigator = StackNavigator(
  {
    FloatingScreen: {
      screen: FloatingScreen,
    },
  },
  {
    initialRouteName: 'LoginScreen',
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

export default FloatingNavigator;
