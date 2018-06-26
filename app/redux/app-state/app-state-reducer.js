const types = {
  APP_STATE_ACTIVE: 'APP_STATE_ACTIVE',
  APP_STATE_INACTIVE: 'APP_STATE_INACTIVE',
  APP_STATE_BACKGROUND: 'APP_STATE_BACKGROUND',
  APP_STATE_UNKNOWN: 'APP_STATE_UNKNOWN',

  APP_STATE_NETWORK_ONLINE: 'APP_STATE_NETWORK_ONLINE',
  APP_STATE_NETWORK_OFFLINE: 'APP_STATE_NETWORK_OFFLINE',

  APP_STATE_POOR_GPS: 'APP_STATE_POOR_GPS',
  APP_STATE_GOOD_GPS: 'APP_STATE_GOOD_GPS',

  APP_STATE_GPS_ERROR: 'APP_STATE_GPS_ERROR',
  APP_STATE_ERROR: 'APP_STATE_ERROR',
  APP_STATE_NETWORK_ERROR: 'APP_STATE_NETWORK_ERROR',
};

type appStateReduxStore = {
  state: 'init' | 'active' | 'background' | 'inactive',
  error: any,
}

const initialState: appStateReduxStore = {
  state: 'init',
  gpsIsPoor: false,
  gpsAccuracy: null,
  gpsIsPending: true,
  networkIsOffline: false,
  networkState: null,
  networkIsPending: true,
  error: null,
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
    case types.APP_STATE_POOR_GPS: {
      return {
        ...state,
        gpsIsPoor: true,
        gpsAccuracy: payload,
        gpsIsPending: false,
      };
    }
    case types.APP_STATE_NETWORK_OFFLINE: {
      return {
        ...state,
        networkIsOffline: true,
        networkState: payload,
        networkIsPending: false,
      };
    }
    case types.APP_STATE_NETWORK_ONLINE: {
      return {
        ...state,
        networkIsOffline: false,
        networkState: payload,
        networkIsPending: false,
      };
    }
    case types.APP_STATE_GOOD_GPS: {
      return {
        ...state,
        gpsIsPoor: false,
        gpsIsPending: false,
        gpsAccuracy: payload,
      };
    }
    case types.APP_STATE_GPS_ERROR:
    case types.APP_STATE_ERROR:
    case types.APP_STATE_NETWORK_ERROR: {
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

export default appStateReducer;
