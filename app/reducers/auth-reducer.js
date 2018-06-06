const types = {
  AUTH_INIT: 'AUTH_INIT',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_SUCCESS_NEW_USER: 'AUTH_SUCCESS_NEW_USER',
  AUTH_NEW_REGISTRATION: 'AUTH_NEW_REGISTRATION',
  AUTH_SIGNOUT: 'AUTH_SIGNOUT',
  AUTH_PHONE_NUMBER_VERIFY: 'AUTH_PHONE_NUMBER_VERIFY',
  AUTH_MAINSAGA_ERROR: 'AUTH_MAINSAGA_ERROR',
  AUTH_SIGNOUT_ERROR: 'AUTH_SIGNOUT_ERROR',
  AUTH_STATE_CHANGED_ERROR: 'AUTH_STATE_CHANGED_ERROR',
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
    case types.AUTH_SIGNOUT_ERROR:
    case types.AUTH_STATE_CHANGED_ERROR:
    case types.AUTH_MAINSAGA_ERROR: {
      return {
        ...state,
        error: payload,
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
