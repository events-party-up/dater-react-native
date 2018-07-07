import { SystemNotification } from '../../types';

export const types = {
  SYSTEM_NOTIFICATIONS_NEW: 'SYSTEM_NOTIFICATIONS_NEW',
};

const initialState: SystemNotification = {
  id: 0,
};

const systemNotificatinosReducer = (state: SystemNotification = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.SYSTEM_NOTIFICATIONS_NEW: {
      return {
        ...state,
        ...payload,
        id: state.id + 1,
      };
    }
    default: {
      return state;
    }
  }
};

export default systemNotificatinosReducer;
