export const types = {
  UPLOAD_PHOTO_START: 'UPLOAD_PHOTO_START',
  UPLOAD_PHOTO_SUCCESS: 'UPLOAD_PHOTO_SUCCESS',
  UPLOAD_PHOTO_RUNNING: 'UPLOAD_PHOTO_RUNNING',
  UPLOAD_PHOTO_ERROR: 'UPLOAD_PHOTO_ERROR',
};

const initialState = {
  running: false,
  progress: 0,
  uri: null,
};

const uploadPhotosReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.UPLOAD_PHOTO_START: {
      return {
        ...initialState,
        ...payload,
        running: true,
      };
    }
    case types.UPLOAD_PHOTO_SUCCESS: {
      return {
        ...state,
        ...payload,
        running: false,
      };
    }
    case types.UPLOAD_PHOTO_RUNNING: {
      return {
        ...state,
        ...payload,
      };
    }
    case types.UPLOAD_PHOTO_ERROR: {
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

export default uploadPhotosReducer;
