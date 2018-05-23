import GeoUtils from '../utils/geo-utils';

const types = {
  FIND_USER_REQUEST: 'FIND_USER_REQUEST',
  FIND_USER_REQUESTED: 'FIND_USER_REQUESTED',
  FIND_USER_INCOMING_REQUEST: 'FIND_USER_INCOMING_REQUEST',
  FIND_USER_DECLINE_REQUEST: 'FIND_USER_DECLINE_REQUEST',
  FIND_USER_DECLINED_BY_TARGET_REQUEST: 'FIND_USER_DECLINED_BY_TARGET_REQUEST',
  FIND_USER_CANCEL_REQUEST: 'FIND_USER_CANCEL_REQUEST',
  FIND_USER_CANCELLED_REQUEST: 'FIND_USER_CANCELLED_REQUEST',
  FIND_USER_ACCEPT_REQUEST: 'FIND_USER_ACCEPT_REQUEST',
  FIND_USER_START: 'FIND_USER_START',
  FIND_USER_STARTED: 'FIND_USER_STARTED',
  FIND_USER_STOP: 'FIND_USER_STOP',
  FIND_USER_TARGET_MOVE: 'FIND_USER_TARGET_MOVE',
  FIND_USER_MY_MOVE: 'FIND_USER_MY_MOVE',
  FIND_USER_MY_MOVE_RECORDED: 'FIND_USER_MY_MOVE_RECORDED',
  FIND_USER_STOPPED: 'FIND_USER_STOPPED',
  FIND_USER_STOPPED_BY_TARGET: 'FIND_USER_STOPPED_BY_TARGET',
  FIND_USER_ERROR: 'FIND_USER_ERROR',
  FIND_USER_TARGET_MOVE_ERROR: 'FIND_USER_TARGET_MOVE_ERROR',
};

const initialState = {
  enabled: false,
  pending: false,
  targetPastCoords: [], // all past coorinates
  myPastCoords: [], // all past coorinates
  targetUserUid: null,
  startDistance: 0,
  currentDistance: 0,
  myScore: 0,
  targetScore: 0,
  microDateId: null,
  targetCurrentCoords: null,
  targetPreviousCoords: null,
  myPreviousCoords: null,
};

const findUserReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.FIND_USER_REQUEST: {
      return {
        ...state,
        targetUserUid: payload.user.id,
        myPastCoords: [payload.myCurrentCoords],
        targetPastCoords: [{ // init state with first coords of target user
          accuracy: payload.user.accuracy,
          latitude: payload.user.geoPoint.latitude,
          longitude: payload.user.geoPoint.longitude,
          timestamp: Date.now(),
        }],
      };
    }
    case types.FIND_USER_REQUESTED:
    case types.FIND_USER_INCOMING_REQUEST: {
      return {
        ...state,
        pending: true,
      };
    }
    case types.FIND_USER_DECLINED_BY_TARGET_REQUEST:
    case types.FIND_USER_CANCELLED_REQUEST:
    case types.FIND_USER_DECLINE_REQUEST: {
      return {
        ...state,
        pending: false,
      };
    }
    case types.FIND_USER_START: {
      return {
        ...state,
        targetUserUid: payload.user.id,
        myPastCoords: [payload.myCoords],
        targetPastCoords: [{ // init state with first coords of target user
          accuracy: payload.user.accuracy,
          latitude: payload.user.geoPoint.latitude,
          longitude: payload.user.geoPoint.longitude,
          timestamp: Date.now(),
        }],
        enabled: true,
        pending: false,
        startDistance: payload.startDistance,
        distance: payload.distance,
        microDateId: payload.microDateId,
      };
    }
    case types.FIND_USER_STOPPED_BY_TARGET:
    case types.FIND_USER_STOPPED: {
      return initialState;
    }
    case types.FIND_USER_TARGET_MOVE: {
      // let { targetScore } = state;
      // const currentUserLastLocation = state.myPastCoords.length > 0 ?
      //   state.myPastCoords[state.myPastCoords.length - 1] : null;
      // let targetPastCoords = buildPastCoords(state.targetPastCoords, payload, currentUserLastLocation); // eslint-disable-line prefer-const

      // if (targetPastCoords.length > 1 && currentUserLastLocation) {
      //   targetScore += targetPastCoords[targetPastCoords.length - 1].opponentDistanceDelta;
      // }
      // if (targetPastCoords.length > MAX_PAST_LOCATIONS) {
      //   targetPastCoords.shift();
      // }

      return {
        ...state,
        targetCurrentCoords: {
          accuracy: payload.accuracy,
          latitude: payload.geoPoint.latitude,
          longitude: payload.geoPoint.longitude,
        },
        // targetPastCoords,
        // currentDistance: payload.distanceFromMe,
        // targetScore,
      };
    }
    case types.FIND_USER_MY_MOVE: {
      // let { myScore } = state;
      // const targetUserLastLocation = state.targetPastCoords.length > 0 ?
      //   state.targetPastCoords[state.targetPastCoords.length - 1] : null;
      // let myPastCoords = buildPastCoords(state.myPastCoords, payload, targetUserLastLocation); // eslint-disable-line prefer-const

      // if (myPastCoords.length > 1 && targetUserLastLocation) {
      //   myScore += myPastCoords[myPastCoords.length - 1].opponentDistanceDelta;
      // }
      // const currentDistance = targetUserLastLocation ?
      //   GeoUtils.distance(targetUserLastLocation, payload) :
      //   state.currentDistance;

      // if (myPastCoords.length > MAX_PAST_LOCATIONS) {
      //   myPastCoords.shift();
      // }

      return {
        ...state,
        // myPastCoords,
        // currentDistance,
        // myScore,
      };
    }
    case types.FIND_USER_MY_MOVE_RECORDED: {
      let { myScore } = state;
      if (state.targetPreviousCoords) {
        const currentDistanceFromOpponent = GeoUtils.distance(payload.newCoords, state.targetPreviousCoords);
        const pastDistanceFromOpponent = GeoUtils.distance(state.myPreviousCoords, state.targetPreviousCoords);
        const opponentDistanceDelta = pastDistanceFromOpponent - currentDistanceFromOpponent;
        myScore += opponentDistanceDelta;
      }
      return {
        ...state,
        myPreviousCoords: payload.newCoords,
        myScore,
        distance: GeoUtils.distance(payload.newCoords, state.targetCurrentCoords),
        targetPreviousCoords: {
          ...state.targetCurrentCoords,
        },
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

// function buildPastCoords(
//   pastCoordsInState: Array<GeoCoordinates>,
//   myCoords: GeoCoordinates,
//   opponentCoords: GeoCoordinates,
// ) {
//   let opponentDistanceDelta;
//   let pastCoords = pastCoordsInState;
//   const previousLocation = [...pastCoords].pop();
//   const distance = previousLocation ? GeoUtils.distance(previousLocation, myCoords) : 0;
//   if (opponentCoords && previousLocation) {
//     const currentDistanceFromOpponent = GeoUtils.distance(myCoords, opponentCoords);
//     const pastDistanceFromOpponent = GeoUtils.distance(previousLocation, opponentCoords);
//     opponentDistanceDelta = pastDistanceFromOpponent - currentDistanceFromOpponent;
//   }

//   // if this is not the first location update && not too small update
//   if (previousLocation && distance > MIN_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
//     const heading = GeoUtils.getBearing(previousLocation, myCoords);
//     const timeDelta = (myCoords.timestamp - previousLocation.timestamp) / 1000; // in seconds
//     const velocity = Math.floor(distance / timeDelta); // in seconds

//     if (
//       velocity < MAX_VELOCITY_FROM_PREVIOUS_PAST_LOCATION && // discard too fast moves, probably a noise from location services
//       myCoords.accuracy < MINIMUM_ACCURACY_PAST_LOCATION // discard not accurate enough locations
//     ) {
//       pastCoords = [...pastCoordsInState, {
//         ...myCoords,
//         heading,
//         distance,
//         velocity,
//         opponentDistanceDelta,
//       }];
//     }
//     // if new coordinate is too far away from the previous one, reset pastCoords
//     // probably user had location services turned off for too long time
//     if (distance > MAX_DISTANCE_FROM_PREVIOUS_PAST_LOCATION) {
//       pastCoords = [myCoords];
//     }
//     // if we just started location tracking
//   } else if (pastCoords.length === 0) {
//     pastCoords = [myCoords];
//   }
//   return pastCoords;
// }

export default findUserReducer;
