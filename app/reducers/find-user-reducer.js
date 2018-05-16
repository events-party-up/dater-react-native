import GeoUtils from '../utils/geo-utils';
import {
  MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  MAX_PAST_LOCATIONS,
  MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION,
  MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION,
  MINIMUM_ACCURACY_PAST_LOCATION,
} from '../constants';
import { GeoCoordinates } from '../types';

const types = {
  FIND_USER_START: 'FIND_USER_START',
  FIND_USER_STARTED: 'FIND_USER_STARTED',
  FIND_USER_STOP: 'FIND_USER_STOP',
  FIND_USER_TARGET_MOVE: 'FIND_USER_TARGET_MOVE',
  FIND_USER_MY_MOVE: 'FIND_USER_MY_MOVE',
  FIND_USER_STOPPED: 'FIND_USER_STOPPED',
  FIND_USER_ERROR: 'FIND_USER_ERROR',
  FIND_USER_TARGET_MOVE_ERROR: 'FIND_USER_TARGET_MOVE_ERROR',
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
        targetPastCoords: [{ // init state with first coords of target user
          latitude: payload.user.geoPoint.latitude,
          longitude: payload.user.geoPoint.longitude,
          timestamp: Date.now(),
        }],
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
      const currentUserLastLocation = state.myPastCoords.length > 0 ?
        state.myPastCoords[state.myPastCoords.length - 1] : null;
      let targetPastCoords = buildPastCoords(state.targetPastCoords, payload, currentUserLastLocation); // eslint-disable-line prefer-const

      if (targetPastCoords.length > 1 && currentUserLastLocation) {
        targetScore += targetPastCoords[targetPastCoords.length - 1].opponentDistanceDelta;
      }
      if (targetPastCoords.length > MAX_PAST_LOCATIONS) {
        targetPastCoords.shift();
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
      const targetUserLastLocation = state.targetPastCoords.length > 0 ?
        state.targetPastCoords[state.targetPastCoords.length - 1] : null;
      let myPastCoords = buildPastCoords(state.myPastCoords, payload, targetUserLastLocation); // eslint-disable-line prefer-const

      if (myPastCoords.length > 1 && targetUserLastLocation) {
        myScore += myPastCoords[myPastCoords.length - 1].opponentDistanceDelta;
      }
      const currentDistance = targetUserLastLocation ?
        GeoUtils.distance(targetUserLastLocation, payload) :
        state.currentDistance;

      if (myPastCoords.length > MAX_PAST_LOCATIONS) {
        myPastCoords.shift();
      }

      return {
        ...state,
        myPastCoords,
        currentDistance,
        myScore,
      };
    }
    case types.FIND_USER_TARGET_MOVE_ERROR:
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

function buildPastCoords(
  pastCoordsInState: Array<GeoCoordinates>,
  myCoords: GeoCoordinates,
  opponentCoords: GeoCoordinates,
) {
  let opponentDistanceDelta;
  let pastCoords = pastCoordsInState;
  const previousLocation = [...pastCoords].pop();
  const distance = previousLocation ? GeoUtils.distance(previousLocation, myCoords) : 0;
  if (opponentCoords && previousLocation) {
    const currentDistanceFromOpponent = GeoUtils.distance(myCoords, opponentCoords);
    const pastDistanceFromOpponent = GeoUtils.distance(previousLocation, opponentCoords);
    opponentDistanceDelta = pastDistanceFromOpponent - currentDistanceFromOpponent;
  }

  // if this is not the first location update && not too small update
  if (previousLocation && distance > MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
    const heading = GeoUtils.getBearing(previousLocation, myCoords);
    const timeDelta = (myCoords.timestamp - previousLocation.timestamp) / 1000; // in seconds
    const velocity = Math.floor(distance / timeDelta); // in seconds

    if (
      velocity < MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION && // discard too fast moves, probably a noise from location services
      myCoords.accuracy < MINIMUM_ACCURACY_PAST_LOCATION // discard not accurate enough locations
    ) {
      pastCoords = [...pastCoordsInState, {
        ...myCoords,
        heading,
        distance,
        velocity,
        opponentDistanceDelta,
      }];
    }
    // if new coordinate is too far away from the previous one, reset pastCoords
    // probably user had location services turned off for too long time
    if (distance > MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
      pastCoords = [myCoords];
    }
    // if we just started location tracking
  } else if (pastCoords.length === 0) {
    pastCoords = [myCoords];
  }
  return pastCoords;
}

export default findUserReducer;
