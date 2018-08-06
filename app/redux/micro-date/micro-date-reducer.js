import GeoUtils from '../../utils/geo-utils';

const types = {
  MICRO_DATE_ASK_ARE_YOU_READY: 'MICRO_DATE_ASK_ARE_YOU_READY',
  MICRO_DATE_IM_READY: 'MICRO_DATE_IM_READY',
  MICRO_DATE_IM_READY_EXPIRED: 'MICRO_DATE_IM_READY_EXPIRED',
  MICRO_DATE_PENDING_SEARCH_CANCEL: 'MICRO_DATE_PENDING_SEARCH_CANCEL',

  MICRO_DATE_START: 'MICRO_DATE_START',
  MICRO_DATE_STOPPED_BY_TARGET: 'MICRO_DATE_STOPPED_BY_TARGET',
  MICRO_DATE_STOPPED_BY_ME: 'MICRO_DATE_STOPPED_BY_ME',
  MICRO_DATE_SELFIE_UPLOADED_BY_TARGET: 'MICRO_DATE_SELFIE_UPLOADED_BY_TARGET',
  MICRO_DATE_SELFIE_UPLOADED_BY_ME: 'MICRO_DATE_SELFIE_UPLOADED_BY_ME',
  MICRO_DATE_SELFIE_DECLINED_BY_TARGET: 'MICRO_DATE_SELFIE_DECLINED_BY_TARGET',
  MICRO_DATE_SELFIE_DECLINED_BY_ME: 'MICRO_DATE_SELFIE_DECLINED_BY_ME',
  MICRO_DATE_FINISH: 'MICRO_DATE_FINISH',

  MICRO_DATE_STOP: 'MICRO_DATE_STOP',
  MICRO_DATE_EXPIRED: 'MICRO_DATE_EXPIRED',

  MICRO_DATE_UPLOAD_PHOTO_START: 'MICRO_DATE_UPLOAD_PHOTO_START',

  MICRO_DATE_MY_MOVE: 'MICRO_DATE_MY_MOVE',
  MICRO_DATE_MY_MOVE_RECORDED: 'MICRO_DATE_MY_MOVE_RECORDED', // move recorded to Firestore
  MICRO_DATE_TARGET_MOVE: 'MICRO_DATE_TARGET_MOVE', // target moves are already qualified by sending party

  MICRO_DATE_ROOT_SAGA_ERROR: 'MICRO_DATE_ROOT_SAGA_ERROR',
  MICRO_DATE_UPDATED_SAGA_ERROR: 'MICRO_DATE_UPDATED_SAGA_ERROR',
  MICRO_DATE_USER_MOVEMENTS_ERROR: 'MICRO_DATE_USER_MOVEMENTS_ERROR',
  MICRO_DATE_TARGET_MOVE_ERROR: 'MICRO_DATE_TARGET_MOVE_ERROR',
  MICRO_DATE_UPDATED_SAGA_UNKNOWN_STATUS_ERROR: 'MICRO_DATE_UPDATED_SAGA_UNKNOWN_STATUS_ERROR',
};

const initialState = {
  id: null,
  enabled: false,
  pending: false,
  photoMode: false,
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
    case types.MICRO_DATE_START: {
      return {
        ...state,
        enabled: true,
        pending: false,
        ...payload,
        myPreviousCoords: {
          ...getGeoPoint(payload.currentUser.geoPoint),
          clientTS: new Date(),
        },
        targetCurrentCoords: getGeoPoint(payload.targetUser.geoPoint),
        headingToTarget: GeoUtils.getBearing(payload.currentUser.geoPoint, payload.targetUser.geoPoint),
      };
    }
    case types.MICRO_DATE_ASK_ARE_YOU_READY:
    case types.MICRO_DATE_PENDING_SEARCH_CANCEL:
    case types.MICRO_DATE_IM_READY_EXPIRED:
    case types.MICRO_DATE_FINISH:
    case types.MICRO_DATE_REMOVE:
    case types.MICRO_DATE_STOPPED_BY_ME: {
      return initialState;
    }
    case types.MICRO_DATE_EXPIRED:
    case types.MICRO_DATE_STOPPED_BY_TARGET: {
      return {
        ...state,
        ...payload,
        enabled: false,
        pending: false,
        photoMode: false,
      };
    }
    case types.MICRO_DATE_SELFIE_UPLOADED_BY_ME:
    case types.MICRO_DATE_UPLOADED_BY_TARGET: {
      return {
        ...state,
        photoMode: true,
        ...payload,
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
        headingToTarget: state.myPreviousCoords && GeoUtils.getBearing(state.myPreviousCoords, payload.geoPoint),
        targetCurrentCoords: {
          accuracy: payload.accuracy,
          ...getGeoPoint(payload.geoPoint),
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
        myPreviousCoords: {
          ...payload.newCoords,
          clientTS: new Date(),
        },
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

function getGeoPoint(geoPoint) {
  return {
    latitude: geoPoint.latitude,
    longitude: geoPoint.longitude,
  };
}
