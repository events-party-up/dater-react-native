const types = {
  MAPVIEW_BUILD_ROUTE_START: 'MAPVIEW_BUILD_ROUTE_START',
  MAPVIEW_BUILD_ROUTE_STARTED: 'MAPVIEW_BUILD_ROUTE_STARTED',
  MAPVIEW_BUILD_ROUTE_FINISH: 'MAPVIEW_BUILD_ROUTE_FINISH',
  MAPVIEW_BUILD_ROUTE_CLEAR: 'MAPVIEW_BUILD_ROUTE_CLEAR',
  MAPVIEW_BUILD_ROUTE_ERROR: 'MAPVIEW_BUILD_ROUTE_ERROR',
};

const initialState = {
  visible: false,
  routeToUser: {},
  route: null,
  error: null,
};

const mapDirectionsReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.MAPVIEW_BUILD_ROUTE_START: {
      return {
        ...state,
        routeToUser: payload,
      };
    }
    case types.MAPVIEW_BUILD_ROUTE_FINISH: {
      return {
        ...state,
        visible: true,
        route: payload,
      };
    }
    case types.MAPVIEW_BUILD_ROUTE_CLEAR: {
      return {
        ...state,
        visible: false,
        route: null,
      };
    }
    case types.MAPVIEW_BUILD_ROUTE_ERROR: {
      return {
        ...state,
        visible: false,
        error: payload,
        route: null,
      };
    }
    default: {
      return state;
    }
  }
};

export default mapDirectionsReducer;
