export const types = {
  UPLOAD_PHOTO_START: 'UPLOAD_PHOTO_START',
  UPLOAD_PHOTO_ERROR: 'UPLOAD_PHOTO_ERROR',
};

const initialState = {
  uploading: false,
  progress: 0,
  photoURI: null,
};

const uploadPhotosReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.UPLOAD_PHOTO_START: {
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
