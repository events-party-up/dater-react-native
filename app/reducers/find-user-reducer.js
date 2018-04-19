import GeoUtils from '../utils/geo-utils';
import {
  MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  MAX_PAST_LOCATIONS,
} from '../constants';

const types = {
  FIND_USER_START: 'FIND_USER_START',
  FIND_USER_STARTED: 'FIND_USER_STARTED',
  FIND_USER_STARTED_STOP: 'FIND_USER_STARTED_STOP',
  FIND_USER_NEW_MOVE: 'FIND_USER_NEW_MOVE',
  FIND_USER_ERROR: 'FIND_USER_ERROR',
};

const initialState = {
  error: null,
  pastCoords: [],
  enabled: false,
  findUserUid: null,
  starting: false,
};

const findUserReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.FIND_USER_START: {
      return {
        ...state,
        starting: true,
        findUserUid: payload.uid,
      };
    }
    case types.FIND_USER_STARTED: {
      return {
        ...state,
        starting: false,
        enabled: true,
      };
    }
    case types.FIND_USER_STOP: {
      return {
        ...state,
        enabled: false,
        findUserUid: null,
        pastCoords: [],
      };
    }
    case types.FIND_USER_NEW_MOVE: {
      let pastCoords = [...state.pastCoords];
      // if this is not the first location update
      const previousLocation = pastCoords.length > 0 ? pastCoords[pastCoords.length - 1] : null;
      if (previousLocation &&
        GeoUtils.distance(previousLocation, payload) > MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
        const moveHeadingAngle = GeoUtils.getRotationAngle(previousLocation, payload);

        pastCoords = [...state.pastCoords, {
          latitude: payload.latitude,
          longitude: payload.longitude,
          moveHeadingAngle,
        }];
        // if we just started location tracking
      } else if (pastCoords.length === 0) {
        pastCoords.push({
          latitude: payload.latitude,
          longitude: payload.longitude,
        });
      }

      if (pastCoords.length > MAX_PAST_LOCATIONS) { // limit number of records
        pastCoords.shift();
      }

      return {
        ...state,
        pastCoords,
      };
    }
    case types.FIND_USER_ERROR: {
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

export default findUserReducer;
