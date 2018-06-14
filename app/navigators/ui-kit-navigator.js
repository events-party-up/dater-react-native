import { StackNavigator } from 'react-navigation';

import TypographyScreen from '../screens/ui-kit/typography-screen';
import DaterButtonsScreen from '../screens/ui-kit/dater-buttons-screen';
import TextInputsScreen from '../screens/ui-kit/textinputs-screen';
import UIKitIndexScreen from '../screens/ui-kit/ui-kit-index-screen';

const UIKitNavigator = StackNavigator(
  {
    UIKitIndexScreen: {
      screen: UIKitIndexScreen,
    },
    TypographyScreen: {
      screen: TypographyScreen,
      headerMode: 'none',
    },
    DaterButtonsScreen: {
      screen: DaterButtonsScreen,
    },
    TextInputsScreen: {
      screen: TextInputsScreen,
    },
  },
  {
    headerMode: 'none',
    header: null,
    initialRouteName: 'UIKitIndexScreen',
  },
);

export default UIKitNavigator;
