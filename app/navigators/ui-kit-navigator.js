import { StackNavigator } from 'react-navigation';

import {
  TypographyScreen,
  DaterButtonsScreen,
  UIKitIndexScreen,
} from '../containers';

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
