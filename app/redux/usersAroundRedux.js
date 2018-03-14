import firebase from 'react-native-firebase';

const types = {
  USERS_AROUND_UPDATED: 'USERS_AROUND_UPDATED',
}
const updateUsersAround = (users) => async (dispatch, getState) => {
  if (getState().auth.isAuthenticated === false) {
    return;
  }

  dispatch({
    type: types.USERS_AROUND_UPDATED,
    payload: users
  });
}

export const usersAroundActionCreators = {
  updateUsersAround,
}

const initialState = [];

export const reducer = (state = initialState, action) => {
  const { type, payload } = action

  switch (type) {
    case types.USERS_AROUND_UPDATED: {
      return payload
    }
    default: {
      return state
    }
  }
}
