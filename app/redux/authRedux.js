const types = {
  AUTH_PENDING: 'AUTH_PENDING',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILED: 'AUTH_FAILED',
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

const authSuccess = (authResponse) => async (dispatch, getState) => {
  dispatch({
    type: types.AUTH_SUCCESS,
    payload: authResponse,
  });
}

export const actionCreators = {
  startAuthentication,
  authSuccess,
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
