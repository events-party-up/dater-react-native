import GeoUtils from '../utils/geo-utils';

const types = {
  MICRO_DATE_REQUEST: 'MICRO_DATE_REQUEST',
  MICRO_DATE_REQUESTED: 'MICRO_DATE_REQUESTED',
  MICRO_DATE_INCOMING_REQUEST: 'MICRO_DATE_INCOMING_REQUEST',

  MICRO_DATE_DECLINE_REQUEST: 'MICRO_DATE_DECLINE_REQUEST', // should be DECLINE_INCOMING
  MICRO_DATE_DECLINED_BY_TARGET_REQUEST: 'MICRO_DATE_DECLINED_BY_TARGET_REQUEST',

  MICRO_DATE_CANCEL_REQUEST: 'MICRO_DATE_CANCEL_REQUEST',
  MICRO_DATE_CANCELLED_REQUEST: 'MICRO_DATE_CANCELLED_REQUEST',
  MICRO_DATE_ACCEPT_REQUEST: 'MICRO_DATE_ACCEPT_REQUEST',

  MICRO_DATE_START: 'MICRO_DATE_START',
  MICRO_DATE_STARTED: 'MICRO_DATE_STARTED',

  MICRO_DATE_STOP: 'MICRO_DATE_STOP',
  MICRO_DATE_STOPPED: 'MICRO_DATE_STOPPED',
  MICRO_DATE_STOPPED_BY_TARGET: 'MICRO_DATE_STOPPED_BY_TARGET',

  MICRO_DATE_MY_MOVE: 'MICRO_DATE_MY_MOVE',
  MICRO_DATE_MY_MOVE_RECORDED: 'MICRO_DATE_MY_MOVE_RECORDED',
  MICRO_DATE_TARGET_MOVE: 'MICRO_DATE_TARGET_MOVE',

  MICRO_DATE_ERROR: 'MICRO_DATE_ERROR',
  MICRO_DATE_TARGET_MOVE_ERROR: 'MICRO_DATE_TARGET_MOVE_ERROR',
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

const microDateReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.MICRO_DATE_REQUEST: {
      return {
        ...state,
        targetUserUid: payload.user.id,
      };
    }
    case types.MICRO_DATE_REQUESTED:
    case types.MICRO_DATE_INCOMING_REQUEST: {
      return {
        ...state,
        pending: true,
      };
    }
    case types.MICRO_DATE_DECLINED_BY_TARGET_REQUEST:
    case types.MICRO_DATE_CANCELLED_REQUEST:
    case types.MICRO_DATE_DECLINE_REQUEST: {
      return {
        ...state,
        pending: false,
      };
    }
    case types.MICRO_DATE_START: {
      return {
        ...state,
        targetUserUid: payload.user.id,
        enabled: true,
        pending: false,
        distance: payload.distance,
        microDateId: payload.microDateId,
      };
    }
    case types.MICRO_DATE_STOPPED_BY_TARGET:
    case types.MICRO_DATE_STOPPED: {
      return initialState;
    }
    case types.MICRO_DATE_TARGET_MOVE: {
      return {
        ...state,
        targetCurrentCoords: {
          accuracy: payload.accuracy,
          latitude: payload.geoPoint.latitude,
          longitude: payload.geoPoint.longitude,
        },
      };
    }
    case types.MICRO_DATE_MY_MOVE_RECORDED: {
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
    case types.MICRO_DATE_TARGET_MOVE_ERROR:
    case types.MICRO_DATE_ERROR: {
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

export default microDateReducer;
