import firebase from 'react-native-firebase';
import { geoActionCreators } from "../redux//geoRedux";
const types = {
  AUTH_PENDING: 'AUTH_PENDING',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_NEW_REGISTRATION: 'AUTH_NEW_REGISTRATION',
}

/**
 * This works because of our redux-thunk middleware in ./store/configureStore
 *
 * ...action creators that return a function instead of an action.
 * The thunk can be used to delay the dispatch of an action,
 * or to dispatch only if a certain condition is met.
 * The inner function receives the functions dispatch and getState as parameters.
 */
const startAuthentication = () => async (dispatch, getState) => {
  if (accessToken) {
    dispatch({
      type: types.AUTH_SUCCESS,
      payload: accessToken,
    })
  } else {
    dispatch({
      type: types.AUTH_PENDING,
    })
  }
}

const authSuccess = (user) => async (dispatch, getState) => {
  await firebase.firestore().collection('users').doc(user.uid).set({
    lastLogin: firebase.firestore.FieldValue.serverTimestamp(),
  }, { merge: true })
  .catch(error => console.error(error));

  dispatch({
    type: types.AUTH_SUCCESS,
    payload: user,
  });
  dispatch(geoActionCreators.geoUpdated(getState().geo.coords))
}

const authNewRegistration = (user) => async (dispatch, getState) => {
  if (user.isNewUser) {
    console.log('Setting first collection value for new user: ', user.uid);
    // await firebase.firestore().collection('users').doc(user.uid).set({
    //   registered: firebase.firestore.FieldValue.serverTimestamp(),
    // })
    // .catch(error => console.error(error));
    await new Promise((resolve) => {
      resolve('Resolved OK')
    })
      .then(msg => console.log(msg));
  }
  console.log('After writing user');
  
  dispatch({
    type: types.AUTH_NEW_REGISTRATION,
    payload: user,
  });
}

export const authActionCreators = {
  startAuthentication,
  authSuccess,
  authNewRegistration,
  authError: (error) => {
    return {
      type: types.AUTH_FAILED,
      payload: error,
    }
  },
}

const initialState = {
  isAuthenticating: false,
  isAuthenticated: false,
  isAnonymous: false,
  uid: null,
  isNewUser: false,
  creationTime: null,
  lastSignInTime: null,
}

export const reducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {
    
    case types.AUTH_PENDING: {
      return Object.assign({}, state, {
        isAuthenticating: true,
      });
    }
    case types.AUTH_SUCCESS: {
      return {
        ...state,
        ...payload,
        isAuthenticating: false,
        isAuthenticated: true,
      }
    }
    case types.AUTH_NEW_REGISTRATION: {
      return {
        ...state,
        ...payload,
        isAuthenticating: false,
        isAuthenticated: true,
      }
    }
    case types.AUTH_FAILED: {
      return Object.assign({}, state, {
        isAuthenticating: false,
        accessToken: null,
        authError: payload,
      });
    }
    default: {
      return state
    }
  }
}
