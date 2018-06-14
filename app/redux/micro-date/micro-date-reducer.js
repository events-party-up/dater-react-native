import GeoUtils from '../../utils/geo-utils';

const types = {

  MICRO_DATE_OUTGOING_REQUEST_INIT: 'MICRO_DATE_OUTGOING_REQUEST_INIT',
  MICRO_DATE_OUTGOING_REQUEST: 'MICRO_DATE_OUTGOING_REQUEST',

  MICRO_DATE_INCOMING_REQUEST: 'MICRO_DATE_INCOMING_REQUEST',

  MICRO_DATE_INCOMING_DECLINE_BY_ME: 'MICRO_DATE_INCOMING_DECLINE_BY_ME',
  MICRO_DATE_INCOMING_DECLINED_BY_ME: 'MICRO_DATE_INCOMING_DECLINED_BY_ME',
  MICRO_DATE_OUTGOING_DECLINED_BY_TARGET: 'MICRO_DATE_OUTGOING_DECLINED_BY_TARGET',

  MICRO_DATE_OUTGOING_CANCEL: 'MICRO_DATE_OUTGOING_CANCEL',
  MICRO_DATE_OUTGOING_CANCELLED: 'MICRO_DATE_OUTGOING_CANCELLED',
  MICRO_DATE_INCOMING_CANCELLED: 'MICRO_DATE_INCOMING_CANCELLED',

  MICRO_DATE_INCOMING_ACCEPT: 'MICRO_DATE_INCOMING_ACCEPT',

  MICRO_DATE_OUTGOING_ACCEPT: 'MICRO_DATE_OUTGOING_ACCEPT',
  MICRO_DATE_INCOMING_START: 'MICRO_DATE_INCOMING_START',
  MICRO_DATE_OUTGOING_STARTED: 'MICRO_DATE_OUTGOING_STARTED',

  MICRO_DATE_STOP: 'MICRO_DATE_STOP',
  MICRO_DATE_INCOMING_STOP_BY_TARGET: 'MICRO_DATE_INCOMING_STOP_BY_TARGET',
  MICRO_DATE_STOPPED: 'MICRO_DATE_STOPPED',
  MICRO_DATE_INCOMING_STOPPED_BY_TARGET: 'MICRO_DATE_INCOMING_STOPPED_BY_TARGET',
  MICRO_DATE_INCOMING_STOPPED_BY_ME: 'MICRO_DATE_INCOMING_STOPPED_BY_ME',
  MICRO_DATE_OUTGOING_STOPPED_BY_ME: 'MICRO_DATE_OUTGOING_STOPPED_BY_ME',
  MICRO_DATE_OUTGOING_STOPPED_BY_TARGET: 'MICRO_DATE_OUTGOING_STOPPED_BY_TARGET',

  MICRO_DATE_UPLOAD_PHOTO_START: 'MICRO_DATE_UPLOAD_PHOTO_START',
  MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME: 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME',
  MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET: 'MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET',
  MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME: 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME',
  MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET: 'MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET',

  MICRO_DATE_OUTGOING_REMOVE: 'MICRO_DATE_OUTGOING_REMOVE',
  MICRO_DATE_INCOMING_REMOVE: 'MICRO_DATE_INCOMING_REMOVE',

  MICRO_DATE_MY_MOVE: 'MICRO_DATE_MY_MOVE',
  MICRO_DATE_MY_MOVE_RECORDED: 'MICRO_DATE_MY_MOVE_RECORDED', // move recorded to Firestore
  MICRO_DATE_TARGET_MOVE: 'MICRO_DATE_TARGET_MOVE', // incoming moves are already qualified by sending party

  MICRO_DATE_OUTGOING_FINISHED: 'MICRO_DATE_OUTGOING_FINISHED',
  MICRO_DATE_INCOMING_FINISHED: 'MICRO_DATE_INCOMING_FINISHED',

  MICRO_DATE_ROOT_SAGA_ERROR: 'MICRO_DATE_ROOT_SAGA_ERROR',
  MICRO_DATE_INCOMING_ERROR: 'MICRO_DATE_INCOMING_ERROR',
  MICRO_DATE_UPDATED_SAGA_ERROR: 'MICRO_DATE_UPDATED_SAGA_ERROR',
  MICRO_DATE_OUTGOING_ERROR: 'MICRO_DATE_OUTGOING_ERROR',
  MICRO_DATE_USER_MOVEMENTS_ERROR: 'MICRO_DATE_USER_MOVEMENTS_ERROR',
  MICRO_DATE_TARGET_MOVE_ERROR: 'MICRO_DATE_TARGET_MOVE_ERROR',
  MICRO_DATE_UPDATED_SAGA_UNKNOWN_STATUS_ERROR: 'MICRO_DATE_UPDATED_SAGA_ERROR',
};

const initialState = {
  id: null,
  enabled: false,
  pending: false,
  photoMode: false,
  targetUserUid: null,
  targetCurrentCoords: null,
  targetPreviousCoords: null,
  headingToTarget: 0,
  myPreviousCoords: null,
  distance: 0,
  myScore: 0,
};

const microDateReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.MICRO_DATE_INCOMING_ACCEPT:
    case types.MICRO_DATE_INCOMING_REQUEST:
    case types.MICRO_DATE_OUTGOING_ACCEPT:
    case types.MICRO_DATE_OUTGOING_REQUEST: {
      return {
        ...state,
        targetUserUid: payload.requestFor,
        microDate: payload,
        pending: true,
        photoMode: false,
      };
    }
    case types.MICRO_DATE_OUTGOING_DECLINED_BY_TARGET:
    case types.MICRO_DATE_OUTGOING_CANCELLED:
    case types.MICRO_DATE_INCOMING_CANCELLED:
    case types.MICRO_DATE_INCOMING_DECLINE_BY_ME: {
      return {
        ...state,
        pending: false,
        photoMode: false,
      };
    }
    case types.MICRO_DATE_OUTGOING_STARTED:
    case types.MICRO_DATE_INCOMING_START: {
      return {
        ...state,
        targetUserUid: payload.targetUser.id,
        enabled: true,
        pending: false,
        distance: payload.distance,
        id: payload.microDateId,
        myPreviousCoords: {
          ...payload.myCoords,
          clientTS: new Date(),
        },
        targetCurrentCoords: payload.targetUser.geoPoint,
        headingToTarget: GeoUtils.getBearing(payload.myCoords, payload.targetUser.geoPoint),
      };
    }
    case types.MICRO_DATE_OUTGOING_FINISHED:
    case types.MICRO_DATE_INCOMING_FINISHED:
    case types.MICRO_DATE_OUTGOING_REMOVE:
    case types.MICRO_DATE_INCOMING_REMOVE:
    case types.MICRO_DATE_INCOMING_STOPPED_BY_ME:
    case types.MICRO_DATE_OUTGOING_STOPPED_BY_ME:
    case types.MICRO_DATE_STOPPED: {
      return initialState;
    }
    case types.MICRO_DATE_INCOMING_STOPPED_BY_TARGET:
    case types.MICRO_DATE_OUTGOING_STOPPED_BY_TARGET: {
      return {
        ...state,
        microDate: payload,
        enabled: false,
        pending: false,
        photoMode: false,
      };
    }
    case types.MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_ME:
    case types.MICRO_DATE_OUTGOING_SELFIE_UPLOADED_BY_TARGET:
    case types.MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_ME:
    case types.MICRO_DATE_INCOMING_SELFIE_UPLOADED_BY_TARGET: {
      return {
        ...state,
        photoMode: true,
        microDate: payload,
      };
    }
    case types.MICRO_DATE_UPLOAD_PHOTO_START: {
      return {
        ...state,
        photoMode: true,
      };
    }
    case types.MICRO_DATE_TARGET_MOVE: {
      return {
        ...state,
        distance: state.myPreviousCoords ? GeoUtils.distance(payload.geoPoint, state.myPreviousCoords) : 0,
        headingToTarget: GeoUtils.getBearing(state.myPreviousCoords, payload.geoPoint),
        targetCurrentCoords: {
          accuracy: payload.accuracy,
          latitude: payload.geoPoint.latitude,
          longitude: payload.geoPoint.longitude,
        },
      };
    }
    case types.MICRO_DATE_MY_MOVE: {
      return {
        ...state,
        distance: GeoUtils.distance(payload, state.targetCurrentCoords),
        headingToTarget: GeoUtils.getBearing(payload, state.targetCurrentCoords),
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
    case types.MICRO_DATE_UPDATED_SAGA_UNKNOWN_STATUS_ERROR:
    case types.MICRO_DATE_UPDATED_SAGA_ERROR:
    case types.MICRO_DATE_OUTGOING_ERROR:
    case types.MICRO_DATE_INCOMING_ERROR:
    case types.MICRO_DATE_USER_MOVEMENTS_HANDLE_MY_MOVE_ERROR:
    case types.MICRO_DATE_USER_MOVEMENTS_ERROR:
    case types.MICRO_DATE_ROOT_SAGA_ERROR:
    case types.MICRO_DATE_TARGET_MOVE_ERROR: {
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
