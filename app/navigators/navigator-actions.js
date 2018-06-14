import React from 'react';
import { StackNavigator, NavigationActions } from 'react-navigation';

// API Reference:
// AppNavigator has same API as https://reactnavigation.org/docs/en/navigation-actions.html#docsNav
// Based on this debate:
// https://github.com/react-navigation/react-navigation/issues/1439#issuecomment-340293063
// And docs:
// https://reactnavigation.org/docs/navigating-without-navigation-prop.html

let navigatorWithActionsRef; // eslint-disable-line
function setTopLevelNavigator(navRef) {
  navigatorWithActionsRef = navRef;
}

const AppNavigator = (RootNavigator) => {
  const TopLevelNavigator = StackNavigator(
    {
      __root__: { screen: RootNavigator },
    },
    {
      headerMode: 'none',
      navigationOptions: {
        headerVisible: false,
      },
    },
  );

  return (props) => (
    <TopLevelNavigator {...props} ref={(navRef) => { setTopLevelNavigator(navRef); }} />
  );
};

const Actions = {
  navigate: (routeName, params) => {
    if (typeof (routeName) === 'string') {
      navigatorWithActionsRef
        .dispatch(NavigationActions.navigate({ type: NavigationActions.NAVIGATE, routeName, params }));
    } else {
      navigatorWithActionsRef
        .dispatch(NavigationActions.navigate(routeName));
    }
  },
  back: (...params) => navigatorWithActionsRef.dispatch(NavigationActions.back(...params)),
  setParams: (...params) => navigatorWithActionsRef.dispatch(NavigationActions.setParams(...params)),
  init: (...params) => navigatorWithActionsRef.dispatch(NavigationActions.init(...params)),
  reset: (...params) => navigatorWithActionsRef.dispatch(NavigationActions.reset(...params)),
  replace: (...params) => navigatorWithActionsRef.dispatch(NavigationActions.replace(...params)),
  push: (...params) => navigatorWithActionsRef.dispatch(NavigationActions.push(...params)),
  pop: (...params) => navigatorWithActionsRef.dispatch(NavigationActions.pop(...params)),
  popToTop: (...params) => navigatorWithActionsRef.dispatch(NavigationActions.popToTop(...params)),
};

export { AppNavigator, Actions, navigatorWithActionsRef };
