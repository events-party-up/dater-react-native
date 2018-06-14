const types = {
  CURRENT_USER_SIGN_IN: 'CURRENT_USER_SIGN_IN',
  CURRENT_USER_SIGN_OUT: 'CURRENT_USER_SIGN_OUT',
  CURRENT_USER_SET_PROFILE_FIELDS: 'CURRENT_USER_SET_PROFILE_FIELDS',
  CURRENT_USER_UPDATED_IN_FIRESTORE: 'CURRENT_USER_UPDATED_IN_FIRESTORE',
  CURRENT_USER_SET_ERROR: 'CURRENT_USER_SET_ERROR',
};

const initialState = {
  gender: null,
  error: null,
};

const currentUserReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.CURRENT_USER_SIGN_IN: {
      return {
        ...state,
        ...payload,
      };
    }
    case types.CURRENT_USER_UPDATED_IN_FIRESTORE: {
      return {
        ...state,
        ...payload,
      };
    }
    case types.CURRENT_USER_SIGN_OUT: {
      return initialState;
    }
    case types.CURRENT_USER_SET_ERROR: {
      return {
        ...state,
        error: payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default currentUserReducer;
