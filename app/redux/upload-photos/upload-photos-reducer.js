export const types = {
  UPLOAD_PHOTO_START: 'UPLOAD_PHOTO_START',
  UPLOAD_PHOTO_SUCCESS: 'UPLOAD_PHOTO_SUCCESS',
  UPLOAD_PHOTO_RUNNING: 'UPLOAD_PHOTO_RUNNING',
  UPLOAD_PHOTO_POST_UPLOAD_SUCCESS: 'UPLOAD_PHOTO_POST_UPLOAD_SUCCESS',

  UPLOAD_PHOTO_ERROR: 'UPLOAD_PHOTO_ERROR',
  UPLOAD_PHOTO_PROFILE_ERROR: 'UPLOAD_PHOTO_PROFILE_ERROR',
  UPLOAD_PHOTO_MICRO_DATE_SELFIE_ERROR: 'UPLOAD_PHOTO_MICRO_DATE_SELFIE_ERROR',
  UPLOAD_PHOTO_PROGRESS_ERROR: 'UPLOAD_PHOTO_PROGRESS_ERROR',
};

const initialState = {
  running: false,
  progress: 0,
  uri: null,
  type: '',
  aspectRatio: null,
  downloadURL: '',
  finished: false,
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
    case types.UPLOAD_PHOTO_POST_UPLOAD_SUCCESS: {
      return initialState;
    }
    case types.UPLOAD_PHOTO_PROGRESS_ERROR:
    case types.UPLOAD_PHOTO_MICRO_DATE_SELFIE_ERROR:
    case types.UPLOAD_PHOTO_PROFILE_ERROR:
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
