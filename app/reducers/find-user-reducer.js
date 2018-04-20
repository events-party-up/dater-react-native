import GeoUtils from '../utils/geo-utils';
import {
  MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  // MAX_PAST_LOCATIONS,
  MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION,
} from '../constants';

const types = {
  FIND_USER_START: 'FIND_USER_START',
  FIND_USER_STARTED: 'FIND_USER_STARTED',
  FIND_USER_STOP: 'FIND_USER_STOP',
  FIND_USER_NEW_MOVE: 'FIND_USER_NEW_MOVE',
  FIND_USER_STOPPED: 'FIND_USER_STOPPED',
  FIND_USER_ERROR: 'FIND_USER_ERROR',
};

const initialState = {
  error: null,
  pastCoords: [], // all past coorinates
  lastCoords: {}, // the latest coorinate
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
    case types.FIND_USER_STOPPED: {
      return {
        ...state,
        enabled: false,
        findUserUid: null,
        pastCoords: [],
      };
    }
    case types.FIND_USER_NEW_MOVE: {
      let pastCoords = [...state.pastCoords];
      const previousLocation = pastCoords.length > 0 ? pastCoords[pastCoords.length - 1] : null;
      const distance = previousLocation ? GeoUtils.distance(previousLocation, payload) : 0;

      // if this is not the first location update && not too small update
      if (previousLocation && distance > MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
        const moveHeadingAngle = GeoUtils.getRotationAngle(previousLocation, payload);
        const timeDelta = (payload.timestamp - previousLocation.timestamp) / 1000; // in seconds
        const velocity = Math.floor(distance / timeDelta); // in seconds

        // discard too fast moves, probably a noise from location services
        if (velocity < MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION) {
          pastCoords = [...state.pastCoords, {
            latitude: payload.latitude,
            longitude: payload.longitude,
            moveHeadingAngle,
            timestamp: payload.timestamp,
            velocity,
          }];
        }
        // if new coordinate is too far away from the previous one, reset pastCoords
        // probably user had location services turned off for too long time
        if (distance > MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
          pastCoords = [payload];
        }
        // if we just started location tracking
      } else if (pastCoords.length === 0) {
        pastCoords.push(payload);
      }

      return {
        ...state,
        pastCoords,
        lastCoords: payload,
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
