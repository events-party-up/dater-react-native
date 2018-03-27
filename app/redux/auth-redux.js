import firebase from 'react-native-firebase';
import DeviceInfo from 'react-native-device-info';
import { Platform } from 'react-native';

import { geoActionCreators } from '../redux';
import BackgroundGeolocation from '../services/background-geolocation';

const types = {
  AUTH_PENDING: 'AUTH_PENDING',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_NEW_REGISTRATION: 'AUTH_NEW_REGISTRATION',
  AUTH_SIGNOUT: 'AUTH_SIGNOUT',
};

/**
 * This works because of our redux-thunk middleware in ./store/configureStore
 *
 * ...action creators that return a function instead of an action.
 * The thunk can be used to delay the dispatch of an action,
 * or to dispatch only if a certain condition is met.
 * The inner function receives the functions dispatch and getState as parameters.
 */
const startAuthentication = (accessToken) => async (dispatch) => {
  if (accessToken) {
    dispatch({
      type: types.AUTH_SUCCESS,
      payload: accessToken,
    });
  } else {
    dispatch({
      type: types.AUTH_PENDING,
    });
  }
};


const authSuccess = (user) => async (dispatch, getState) => {
  await firebase.firestore()
    .collection('users')
    .doc(user.uid)
    .set({}, { merge: true })
    .catch((error) => console.error(error));

  await firebase.firestore()
    .collection('geoPoints')
    .doc(user.uid)
    .set({}, { merge: true })
    .catch((error) => console.error(error));

  await firebase.firestore()
    .collection('users')
    .doc(user.uid)
    .update({
      device: {
        isEmulator: DeviceInfo.isEmulator(),
        osVersion: DeviceInfo.getSystemVersion(),
        uuid: DeviceInfo.getUniqueID(),
        platform: Platform.OS,
        locale: DeviceInfo.getDeviceLocale(),
      },
    })
    .catch((error) => console.error(error));

  dispatch({
    type: types.AUTH_SUCCESS,
    payload: user,
  });
  // BackgroundGeolocation.init(dispatch);
  // dispatch(geoActionCreators.geoUpdated(getState().geo.coords));
};

const authSignOut = () => async (dispatch) => {
  dispatch({
    type: types.AUTH_SIGNOUT,
  });
};

const authNewRegistration = (user) => async (dispatch) => {
  if (user.isNewUser) {
    console.log('Setting first collection value for new user: ', user.uid);
    await firebase.firestore().collection('users').doc(user.uid).set({
      registered: firebase.firestore.FieldValue.serverTimestamp(),
    })
      .catch((error) => console.error(error));
  }
  console.log('After writing user');

  dispatch({
    type: types.AUTH_NEW_REGISTRATION,
    payload: user,
  });
};

export const authActionCreators = {
  startAuthentication,
  authSuccess,
  authNewRegistration,
  authSignOut,
  authError: (error) => ({
    type: types.AUTH_FAILED,
    payload: error,
  }),
};

const initialState = {
  isAuthenticating: false,
  isAuthenticated: false,
  isAnonymous: false,
  uid: null,
  isNewUser: false,
  creationTime: null,
  lastSignInTime: null,
};

export const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.AUTH_PENDING: {
      return {
        ...state,
        isAuthenticating: true,
      };
    }
    case types.AUTH_SUCCESS: {
      return {
        ...state,
        ...payload,
        isAuthenticating: false,
        isAuthenticated: true,
      };
    }
    case types.AUTH_NEW_REGISTRATION: {
      return {
        ...state,
        ...payload,
        isAuthenticating: false,
        isAuthenticated: true,
      };
    }
    case types.AUTH_FAILED: {
      return {
        ...state,
        isAuthenticating: false,
        accessToken: null,
        authError: payload,
      };
    }
    case types.AUTH_SIGNOUT: {
      return {
        ...state,
        ...initialState,
      };
    }
    default: {
      return state;
    }
  }
};

