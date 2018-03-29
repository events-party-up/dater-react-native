const types = {
  AUTH_INIT: 'AUTH_INIT',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_SUCCESS_NEW_USER: 'AUTH_SUCCESS_NEW_USER',
  AUTH_FAILED: 'AUTH_FAILED',
  AUTH_NEW_REGISTRATION: 'AUTH_NEW_REGISTRATION',
  AUTH_SIGNOUT: 'AUTH_SIGNOUT',
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

const authReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.AUTH_INIT: {
      return {
        ...state,
        isAuthenticating: true,
      };
    }
    case types.AUTH_SUCCESS_NEW_USER:
    case types.AUTH_SUCCESS: {
      return {
        ...state,
        uid: payload.uid,
        isAnonymous: payload.isAnonymous,
        isNewUser: payload.isNewUser,
        creationTime: payload.metadata.creationTime,
        lastSignInTime: payload.metadata.lastSignInTime,
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

export default authReducer;
