import { StackNavigator } from 'react-navigation';

import TypographyScreen from '../screens/ui-kit/typography-screen';
import DaterButtonsScreen from '../screens/ui-kit/dater-buttons-screen';
import UIKitIndexScreen from '../screens/ui-kit/ui-kit-index-screen';

const UIKitNavigator = StackNavigator(
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

export default UIKitNavigator;
