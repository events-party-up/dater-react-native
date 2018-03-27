const types = {
  GEO_STOP_BACKGROUND_SERVICES: 'GEO_STOP_BACKGROUND_SERVICES',
  GEO_START_BACKGROUND_SERVICES: 'GEO_START_BACKGROUND_SERVICES',
  GEO_COMPASS_HEADING_START: 'GEO_COMPASS_HEADING_START',
  GEO_COMPASS_HEADING_STARTED: 'GEO_COMPASS_HEADING_STARTED',
  GEO_COMPASS_HEADING_STOP: 'GEO_COMPASS_HEADING_STOP',
  GEO_COMPASS_HEADING_STOPPED: 'GEO_COMPASS_HEADING_STOPPED',
  GEO_COMPASS_HEADING_UPDATE: 'GEO_COMPASS_HEADING_UPDATE',
  GEO_COMPASS_HEADING_UNAVAILABLE: 'GEO_COMPASS_HEADING_UNAVAILABLE',
  GEO_COMPASS_UNKNOWN_ERROR: 'GEO_COMPASS_UNKNOWN_ERROR',
};

const initialState = {
  heading: 0,
  enabled: false,
  error: null,
};

const compassReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.GEO_COMPASS_HEADING_START: {
      return {
        ...state,
        heading: 0,
        enabled: false,
      };
    }
    case types.GEO_COMPASS_HEADING_STARTED: {
      return {
        ...state,
        enabled: true,
      };
    }
    case types.GEO_COMPASS_HEADING_STOP: {
      return {
        ...state,
        heading: 0,
        enabled: false,
      };
    }
    case types.GEO_COMPASS_HEADING_STOPPED: {
      return initialState;
    }
    case types.GEO_COMPASS_HEADING_UPDATE: {
      return {
        ...state,
        heading: payload,
      };
    }
    case types.GEO_COMPASS_HEADING_UNAVAILABLE: {
      return initialState;
    }
    case types.GEO_COMPASS_UNKNOWN_ERROR: {
      return {
        ...state,
        enabled: false,
        error: payload,
        heading: 0,
      };
    }
    default: {
      return state;
    }
  }
};

export default compassReducer;
