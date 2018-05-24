const types = {
  USERS_AROUND_UPDATED: 'USERS_AROUND_UPDATED',
  USERS_AROUND_MICRO_DATE_UPDATED: 'USERS_AROUND_MICRO_DATE_UPDATED',
  USERS_AROUND_RESTART: 'USERS_AROUND_RESTART',
  USERS_AROUND_STOP: 'USERS_AROUND_STOP',
  USERS_AROUND_STOPPED: 'USERS_AROUND_STOPPED',
  USERS_AROUND_START: 'USERS_AROUND_START',
  USERS_AROUND_STARTED: 'USERS_AROUND_STARTED',
  USERS_AROUND_SAGA_ERROR: 'USERS_AROUND_SAGA_ERROR',
  USERS_AROUND_CHANNEL_ERROR: 'USERS_AROUND_CHANNEL_ERROR',
};

const initialState = {
  error: null,
  enabled: false,
  users: [],
};

const usersAroundReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.USERS_AROUND_MICRO_DATE_UPDATED:
    case types.USERS_AROUND_UPDATED: {
      return {
        ...state,
        users: payload,
      };
    }
    case types.USERS_AROUND_STARTED: {
      return {
        ...state,
        enabled: true,
      };
    }
    case types.USERS_AROUND_STOPPED: {
      return initialState;
    }
    case types.USERS_AROUND_CHANNEL_ERROR:
    case types.USERS_AROUND_SAGA_ERROR: {
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

export default usersAroundReducer;
