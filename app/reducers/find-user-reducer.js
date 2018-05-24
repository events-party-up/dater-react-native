import GeoUtils from '../utils/geo-utils';

const types = {
  FIND_USER_REQUEST: 'FIND_USER_REQUEST',
  FIND_USER_REQUESTED: 'FIND_USER_REQUESTED',
  FIND_USER_INCOMING_REQUEST: 'FIND_USER_INCOMING_REQUEST',

  FIND_USER_DECLINE_REQUEST: 'FIND_USER_DECLINE_REQUEST', // should be DECLINE_INCOMING
  FIND_USER_DECLINED_BY_TARGET_REQUEST: 'FIND_USER_DECLINED_BY_TARGET_REQUEST',

  FIND_USER_CANCEL_REQUEST: 'FIND_USER_CANCEL_REQUEST',
  FIND_USER_CANCELLED_REQUEST: 'FIND_USER_CANCELLED_REQUEST',
  FIND_USER_ACCEPT_REQUEST: 'FIND_USER_ACCEPT_REQUEST',

  FIND_USER_START: 'FIND_USER_START',
  FIND_USER_STARTED: 'FIND_USER_STARTED',

  FIND_USER_STOP: 'FIND_USER_STOP',
  FIND_USER_STOPPED: 'FIND_USER_STOPPED',
  FIND_USER_STOPPED_BY_TARGET: 'FIND_USER_STOPPED_BY_TARGET',

  FIND_USER_MY_MOVE: 'FIND_USER_MY_MOVE',
  FIND_USER_MY_MOVE_RECORDED: 'FIND_USER_MY_MOVE_RECORDED',
  FIND_USER_TARGET_MOVE: 'FIND_USER_TARGET_MOVE',

  FIND_USER_ERROR: 'FIND_USER_ERROR',
  FIND_USER_TARGET_MOVE_ERROR: 'FIND_USER_TARGET_MOVE_ERROR',
};

const initialState = {
  enabled: false,
  pending: false,
  targetUserUid: null,
  microDateId: null,
  targetCurrentCoords: null,
  targetPreviousCoords: null,
  myPreviousCoords: null,
  distance: 0,
  myScore: 0,
};

const findUserReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.FIND_USER_REQUEST: {
      return {
        ...state,
        targetUserUid: payload.user.id,
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
        enabled: true,
        pending: false,
        distance: payload.distance,
        microDateId: payload.microDateId,
      };
    }
    case types.FIND_USER_STOPPED_BY_TARGET:
    case types.FIND_USER_STOPPED: {
      return initialState;
    }
    case types.FIND_USER_TARGET_MOVE: {
      return {
        ...state,
        targetCurrentCoords: {
          accuracy: payload.accuracy,
          latitude: payload.geoPoint.latitude,
          longitude: payload.geoPoint.longitude,
        },
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
        distance: state.targetCurrentCoords ?
          GeoUtils.distance(payload.newCoords, state.targetCurrentCoords) : state.distance,
        targetPreviousCoords: state.targetCurrentCoords ? {
          ...state.targetCurrentCoords,
        } : state.targetPreviousCoords,
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

export default findUserReducer;
