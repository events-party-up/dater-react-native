import GeoUtils from '../utils/geo-utils';
import {
  MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  // MAX_PAST_LOCATIONS,
  MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION,
  MINIMUM_ACCURACY_PAST_LOCATION,
} from '../constants';

const types = {
  FIND_USER_START: 'FIND_USER_START',
  FIND_USER_STARTED: 'FIND_USER_STARTED',
  FIND_USER_STOP: 'FIND_USER_STOP',
  FIND_USER_TARGET_MOVE: 'FIND_USER_TARGET_MOVE',
  FIND_USER_MY_MOVE: 'FIND_USER_MY_MOVE',
  FIND_USER_STOPPED: 'FIND_USER_STOPPED',
  FIND_USER_ERROR: 'FIND_USER_ERROR',
};

const initialState = {
  error: null,
  targetPastCoords: [], // all past coorinates
  myPastCoords: [], // all past coorinates
  enabled: false,
  targetUserUid: null,
  starting: false,
  startDistance: 0,
  currentDistance: 0,
  myScore: 0,
  targetScore: 0,
};

const findUserReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.FIND_USER_START: {
      return {
        ...state,
        starting: true,
        targetUserUid: payload.user.uid,
        myPastCoords: [payload.myCurrentCoords],
      };
    }
    case types.FIND_USER_STARTED: {
      return {
        ...state,
        starting: false,
        enabled: true,
        startDistance: payload.startDistance,
      };
    }
    case types.FIND_USER_STOPPED: {
      return initialState;
    }
    case types.FIND_USER_TARGET_MOVE: {
      let { targetScore } = state;
      const targetPastCoords = buildPastCoords(state.targetPastCoords, payload);
      const myLastLocation = state.myPastCoords.length > 0 ?
        state.myPastCoords[state.myPastCoords.length - 1] : null;
      const currentDistance = myLastLocation ?
        GeoUtils.distance(payload, myLastLocation) : state.currentDistance;
      if (targetPastCoords.length > 1 && myLastLocation) {
        const previousDistance = GeoUtils.distance(myLastLocation, targetPastCoords[targetPastCoords.length - 2]);
        const distanceDelta = previousDistance - currentDistance;
        targetScore += distanceDelta;
      }

      return {
        ...state,
        targetPastCoords,
        currentDistance: payload.distanceFromMe,
        targetScore,
      };
    }
    case types.FIND_USER_MY_MOVE: {
      let { myScore } = state;
      const myPastCoords = buildPastCoords(state.myPastCoords, payload);
      const lastTargetLocation = state.targetPastCoords.length > 0 ?
        state.targetPastCoords[state.targetPastCoords.length - 1] : null;
      const currentDistance = lastTargetLocation ?
        GeoUtils.distance(payload, lastTargetLocation) : state.currentDistance;
      if (myPastCoords.length > 1 && lastTargetLocation) {
        const previousDistance = GeoUtils.distance(lastTargetLocation, myPastCoords[myPastCoords.length - 2]);
        const distanceDelta = previousDistance - currentDistance;
        myScore += distanceDelta;
      }
      return {
        ...state,
        myPastCoords,
        currentDistance,
        myScore,
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

function buildPastCoords(pastCoordsInState, newCoords) {
  let pastCoords = [...pastCoordsInState];
  const previousLocation = pastCoords.length > 0 ? pastCoords[pastCoords.length - 1] : null;
  const distance = previousLocation ? GeoUtils.distance(previousLocation, newCoords) : 0;
  // if this is not the first location update && not too small update
  if (previousLocation && distance > MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
    const moveHeadingAngle = GeoUtils.getRotationAngle(previousLocation, newCoords);
    const timeDelta = (newCoords.timestamp - previousLocation.timestamp) / 1000; // in seconds
    const velocity = Math.floor(distance / timeDelta); // in seconds

    if (
      velocity < MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION && // discard too fast moves, probably a noise from location services
      newCoords.accuracy < MINIMUM_ACCURACY_PAST_LOCATION // discard not accurate enough locations
    ) {
      pastCoords = [...pastCoordsInState, {
        ...newCoords,
        moveHeadingAngle,
        velocity,
      }];
    }
    // if new coordinate is too far away from the previous one, reset pastCoords
    // probably user had location services turned off for too long time
    if (distance > MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
      pastCoords = [newCoords];
    }
    // if we just started location tracking
  } else if (pastCoords.length === 0) {
    pastCoords.push(newCoords);
  }
  return pastCoords;
}

export default findUserReducer;
