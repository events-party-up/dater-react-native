import GeoUtils from '../utils/geo-utils';
import { MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION } from '../constants';

const types = {
  GEO_PERMISSION_REQUESTED: 'GEO_PERMISSION_REQUESTED',
  GEO_PERMISSION_GRANTED: 'GEO_PERMISSION_GRANTED',
  GEO_PERMISSION_DENIED: 'GEO_PERMISSION_DENIED',
  GEO_LOCATION_INITIALIZE: 'GEO_LOCATION_INITIALIZE',
  GEO_LOCATION_INITIALIZED: 'GEO_LOCATION_INITIALIZED',
  GEO_LOCATION_START: 'GEO_LOCATION_START',
  GEO_LOCATION_STARTED: 'GEO_LOCATION_STARTED',
  GEO_LOCATION_STOP: 'GEO_LOCATION_STOP',
  GEO_LOCATION_STOPPED: 'GEO_LOCATION_STOPPED',
  GEO_LOCATION_UPDATE: 'GEO_LOCATION_UPDATE',
  GEO_LOCATION_UPDATED: 'GEO_LOCATION_UPDATED',
  GEO_LOCATION_SET_FIRST_COORDS: 'GEO_LOCATION_SET_FIRST_COORDS',
  GEO_LOCATION_MAINSAGA_ERROR: 'GEO_LOCATION_MAINSAGA_ERROR',
  GEO_LOCATION_UPDATE_FIRESTORE_ERROR: 'GEO_LOCATION_UPDATE_FIRESTORE_ERROR',
  GEO_LOCATION_UPDATE_CHANNEL_ERROR: 'GEO_LOCATION_UPDATE_CHANNEL_ERROR',
  GEO_LOCATION_UPDATE_CHANNEL_UNKNOWN_ERROR: 'GEO_LOCATION_UPDATE_CHANNEL_UNKNOWN_ERROR',
};

const initialState = {
  coords: null,
  firstCoords: null,
  geoUpdates: 0,
  error: null,
  geoGranted: false,
  enabled: false,
  starting: false,
  stopping: false,
  updating: false,
  initializing: false,
  pastCoords: [],
  moveHeadingAngle: 0,
};

const locationReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.GEO_LOCATION_INITIALIZE: {
      return {
        ...state,
        initializing: true,
      };
    }
    case types.GEO_LOCATION_INITIALIZED: {
      return {
        ...state,
        initializing: false,
      };
    }
    case types.GEO_LOCATION_START: {
      return {
        ...state,
        starting: true,
      };
    }
    case types.GEO_LOCATION_STARTED: {
      return {
        ...state,
        starting: false,
        enabled: true,
        firstCoords: {
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      };
    }
    case types.GEO_LOCATION_SET_FIRST_COORDS: {
      return {
        ...state,
        firstCoords: {
          latitude: payload.latitude,
          longitude: payload.longitude,
        },
      };
    }
    case types.GEO_LOCATION_STOP: {
      return {
        ...state,
        stopping: true,
      };
    }
    case types.GEO_LOCATION_STOPPED: {
      return {
        ...state,
        stopping: false,
        enabled: false,
        pastCoords: [],
      };
    }
    case types.GEO_LOCATION_UPDATE_CHANNEL_UNKNOWN_ERROR:
    case types.GEO_LOCATION_UPDATE_CHANNEL_ERROR:
    case types.GEO_LOCATION_UPDATE_FIRESTORE_ERROR:
    case types.GEO_LOCATION_MAINSAGA_ERROR: {
      return {
        ...state,
        error: payload,
      };
    }
    case types.GEO_LOCATION_UPDATE: {
      return {
        ...state,
        updating: true,
      };
    }
    case types.GEO_LOCATION_UPDATED: {
      let { moveHeadingAngle } = state;
      let pastCoords = [...state.pastCoords];

      // if this is not the first location update
      if (state.coords) {
        moveHeadingAngle = GeoUtils.getRotationAngle(state.coords, payload);
      }

      if (pastCoords.length > 0 &&
        GeoUtils.distance(pastCoords[pastCoords.length - 1], state.coords) > MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
        pastCoords = state.coords ? [...state.pastCoords, {
          latitude: state.coords.latitude,
          longitude: state.coords.longitude,
          moveHeadingAngle,
        }] : [];
        // if we just started location tracking
      } else if (pastCoords.length === 0 && state.coords) {
        pastCoords.push({
          latitude: state.coords.latitude,
          longitude: state.coords.longitude,
        });
      }

      return {
        ...state,
        coords: payload,
        geoUpdates: state.geoUpdates + 1,
        pastCoords,
        moveHeadingAngle,
      };
    }
    default: {
      return state;
    }
  }
};

export default locationReducer;
