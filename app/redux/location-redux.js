import firebase from 'react-native-firebase';
import GeoCoordinates from '../types';

const types = {
  GEO_UPDATED: 'GEO_UPDATED',
  GEO_MAPVIEW_UPDATED: 'GEO_MAPVIEW_UPDATED',
  GEO_PERMISSION_REQUESTED: 'GEO_PERMISSION_REQUESTED',
  GEO_PERMISSION_GRANTED: 'GEO_PERMISSION_GRANTED',
  GEO_PERMISSION_DENIED: 'GEO_PERMISSION_DENIED',
  GEO_STOP_BACKGROUND_SERVICES: 'GEO_STOP_BACKGROUND_SERVICES',
  GEO_START_BACKGROUND_SERVICES: 'GEO_START_BACKGROUND_SERVICES',
};

const geoUpdated = (coords: GeoCoordinates) => async (dispatch, getState) => {
  const { uid } = getState().auth;

  if (!coords) {
    return;
  }
  if (uid !== null) {
    await firebase.firestore().collection('geoPoints').doc(uid).update({
      accuracy: coords.accuracy,
      heading: coords.heading,
      speed: coords.speed,
      geoPoint: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
      // .then(() => console.log('Successfully updated geo data'))
      .catch((error) => console.error(error));
  }

  dispatch({
    type: types.GEO_UPDATED,
    payload: coords,
  });
};

const geoRequest = () => ({
  type: types.GEO_PERMISSION_REQUESTED,
});

const geoGranted = (coords) => ({
  type: types.GEO_PERMISSION_GRANTED,
  payload: coords,
});

const geoDenied = (error) => ({
  type: types.GEO_PERMISSION_DENIED,
  payload: error,
});

const stopBgServices = () => ({
  type: types.GEO_STOP_BACKGROUND_SERVICES,
});

const startBgServices = () => ({
  type: types.GEO_START_BACKGROUND_SERVICES,
});

export const geoActionCreators = {
  geoUpdated,
  geoRequest,
  geoGranted,
  geoDenied,
  stopBgServices,
  startBgServices,
};

const initialState = {
  coords: null,
  geoUpdates: 0,
  error: null,
  geoGranted: false,
  bgServicesEnabled: false,
};

export const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.GEO_UPDATED: {
      return {
        ...state,
        coords: payload,
        geoUpdates: state.geoUpdates + 1,
      };
    }
    case types.GEO_MAPVIEW_UPDATED: {
      return {
        ...state,
        mapView: payload,
      };
    }
    case types.GEO_START_BACKGROUND_SERVICES: {
      return {
        ...state,
        bgServicesEnabled: true,
      };
    }
    case types.GEO_STOP_BACKGROUND_SERVICES: {
      return {
        ...state,
        bgServicesEnabled: false,
      };
    }
    default: {
      return state;
    }
  }
};

