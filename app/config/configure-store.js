import { createStore, applyMiddleware, combineReducers } from 'redux';
import createSagaMiddleware from 'redux-saga';
// import { persistStore, autoRehydrate } from 'redux-persist';
// Thunk middleware allows actions to be chained and waited on by returning
// a function from that action
// https://github.com/gaearon/redux-thunk
import thunk from 'redux-thunk';
import Reactotron from 'reactotron-react-native';
// Logs all actions going through redux into console
// https://github.com/evgenyrodionov/redux-logger
import { createLogger } from 'redux-logger';
import reducer from '../redux/index';
import rootSaga from '../sagas/root-saga';

let storeCreator;
let sagaMiddleware;

if (process.env.NODE_ENV === 'development') {
  require('./reactotron-config'); // eslint-disable-line global-require
  const sagaMonitor = Reactotron.createSagaMonitor();
  sagaMiddleware = createSagaMiddleware({ sagaMonitor });
} else {
  sagaMiddleware = createSagaMiddleware();
}

// http://redux.js.org/docs/advanced/Middleware.html
const middleware = [thunk, sagaMiddleware];

if (process.env.NODE_ENV === 'development') {
  middleware.push(createLogger());
  storeCreator = Reactotron.createStore;
} else {
  storeCreator = createStore;
  console.tron = {
    log: (message) => {
      console.log(message);
    },
  };
}

// Can use a preloaded initialState if available, in this case we don't
export default (initialState) => {
  if (module.hot) {
    console.log('Enabling hot reloading for store');
    // Enable Webpack hot module replacement for reducers
    module.hot.accept(() => {
      console.log('Replacing store');
      const nextRootReducer = require('../redux/index').default; // eslint-disable-line global-require
      store.replaceReducer(nextRootReducer);
    });
  }

  // if (module.hot) {
  //   module.hot.accept(() => {
  //     console.log('Replacing store');
  //     const nextRootReducer = require('../redux/index').default; // eslint-disable-line global-require
  //     store.replaceReducer(nextRootReducer);

  //     //   load(store)
  //     //     .then((newState) => console.log('Loaded state:', newState))
  //     // });
  //   });
  // }
  // http://redux.js.org/docs/api/createStore.html
  const store = storeCreator(
    reducer,
    initialState,
    applyMiddleware(...middleware),
    // autoRehydrate()
  );
  // https://github.com/rt2zz/redux-persist
  // persistStore(store)


  sagaMiddleware.run(rootSaga);
  return store;
};
