const types = {
  APP_STATE_ACTIVE: 'APP_STATE_ACTIVE',
  APP_STATE_INACTIVE: 'APP_STATE_INACTIVE',
  APP_STATE_BACKGROUND: 'APP_STATE_BACKGROUND',
  APP_STATE_UNKNOWN: 'APP_STATE_UNKNOWN',
  APP_STATE_ERROR: 'APP_STATE_ERROR',
};

const initialState = {
  state: 'unknown',
};

const appStateReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.APP_STATE_ACTIVE:
    case types.APP_STATE_INACTIVE:
    case types.APP_STATE_UNKNOWN:
    case types.APP_STATE_BACKGROUND: {
      return {
        ...state,
        state: payload,
      };
    }
    case types.APP_STATE_ERROR: {
      return {
        ...state,
        error: payload,
      };
    }
    default: {
      return {
        ...state,
        state: 'unknown',
      };
    }
  }
};

export default appStateReducer;
