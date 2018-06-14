export const types = {
  PERMISSIONS_FCM_REQUEST: 'PERMISSIONS_FCM_REQUEST',
  PERMISSIONS_FCM_GRANTED: 'PERMISSIONS_FCM_GRANTED',
  PERMISSIONS_FCM_DENIED: 'PERMISSIONS_FCM_ENABLED',
  PERMISSIONS_FCM_ERROR: 'PERMISSIONS_FCM_ERROR',
};

const initialState = {
  fcmGranted: false,
  fcmDenied: false,
  fcmRequesting: false,
};

const permissionsReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.PERMISSIONS_FCM_REQUEST: {
      return {
        ...state,
        fcmRequesting: true,
      };
    }
    case types.PERMISSIONS_FCM_GRANTED: {
      return {
        ...state,
        fcmGranted: true,
        fcmRequesting: false,
      };
    }
    case types.PERMISSIONS_FCM_DENIED: {
      return {
        ...state,
        fcmDenied: true,
        fcmGranted: false,
        fcmRequesting: false,
      };
    }
    case types.PERMISSIONS_FCM_ERROR: {
      return {
        ...state,
        fcmRequesting: false,
        error: payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default permissionsReducer;
