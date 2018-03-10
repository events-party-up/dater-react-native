import firebase from 'react-native-firebase';

const types = {
  GEO_UPDATED: 'GEO_UPDATED',
  GEO_PERMISSION_REQUESTED: 'GEO_PERMISSION_REQUESTED',
  GEO_PERMISSION_GRANTED: 'GEO_PERMISSION_GRANTED',
  GEO_PERMISSION_DENIED: 'GEO_PERMISSION_DENIED',
}

export const geoActionCreators = {
  geoUpdated: (coords)  => async (dispatch, getState) => {
    const uid = getState().auth.uid;

    if (uid !== null) {
      await firebase.firestore().collection('users').doc(uid).update({
        coords: coords,
        geoPoint: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
        geoTS: firebase.firestore.FieldValue.serverTimestamp(),
      })
        // .then(() => console.log('Successfully updated geo data'))
        .catch(error => console.error(error));
    }

    dispatch({
      type: types.GEO_UPDATED,
      payload: coords
    });
  },
  geoRequest: () => {
    return {
      type: types.GEO_PERMISSION_REQUESTED,
    }
  },
  geoGranted: (coords) => {
    return {
      type: types.GEO_PERMISSION_GRANTED,
      payload: coords,
    }
  },
  geoDenied: (error) => {
    return {
      type: types.GEO_PERMISSION_DENIED,
      payload: error,
    }
  },
}

const initialState = {
  coords: {
    latitude: 55.751244,
    longitude: 37.618423,
  },
  error: null,
  geoGranted: false,
}

//implement your reducer
export const reducer = (state = initialState, action) => {
  const {type, payload} = action

  switch (type) {
    case types.GEO_UPDATED: {
      return {
        ...state,
        coords: payload,
      }
    }
    case types.POSTS_SUCCESS: {
      return Object.assign({}, state, {
        posts: payload,
        postsRequestPending: false,
      })
    }
    case types.POSTS_ERROR: {
      return Object.assign({}, state, {
        postsError: payload,
        postsRequestPending: false,
      })
    }
    default: {
      return state
    }
  }
}
