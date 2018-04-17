const types = {
  USERS_AROUND_UPDATED: 'USERS_AROUND_UPDATED',
  USERS_AROUND_RESTART: 'USERS_AROUND_RESTART',
  USERS_AROUND_SAGA_ERROR: 'USERS_AROUND_SAGA_ERROR',
  USERS_AROUND_CHANNEL_ERROR: 'USERS_AROUND_CHANNEL_ERROR',
};

const initialState = {
  error: null,
  users: [],
};

const usersAroundReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.USERS_AROUND_UPDATED: {
      return {
        ...state,
        users: payload,
      };
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
