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
  GEO_COMPASS_HEADING_START: 'GEO_COMPASS_HEADING_START',
  GEO_COMPASS_HEADING_STARTED: 'GEO_COMPASS_HEADING_STARTED',
  GEO_COMPASS_HEADING_STOP: 'GEO_COMPASS_HEADING_STOP',
  GEO_COMPASS_HEADING_STOPPED: 'GEO_COMPASS_HEADING_STOPPED',
  GEO_COMPASS_HEADING_UPDATE: 'GEO_COMPASS_HEADING_UPDATE',
  GEO_COMPASS_HEADING_UNAVAILABLE: 'GEO_COMPASS_HEADING_UNAVAILABLE',
  GEO_COMPASS_UNKNOWN_ERROR: 'GEO_COMPASS_UNKNOWN_ERROR',
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

const stopCompassHeading = () => ({
  type: types.GEO_COMPASS_HEADING_STOP,
});

const updateCompassHeading = (heading) => ({
  type: types.GEO_COMPASS_HEADING_UPDATE,
  payload: heading,
});

const compassHeadingUnavailable = () => ({
  type: types.GEO_COMPASS_HEADING_UNAVAILABLE,
});

export const geoActionCreators = {
  geoUpdated,
  geoRequest,
  geoGranted,
  geoDenied,
  stopBgServices,
  startBgServices,
  updateCompassHeading,
  compassHeadingUnavailable,
  stopCompassHeading,
};

const initialState = {
  coords: null,
  compass: {
    heading: 0,
    enabled: false,
    error: null,
  },
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
    case types.GEO_COMPASS_HEADING_START: {
      return {
        ...state,
        compass: {
          heading: 0,
          enabled: false,
        },
      };
    }
    case types.GEO_COMPASS_HEADING_STARTED: {
      return {
        ...state,
        compass: {
          ...state.compass,
          enabled: true,
        },
      };
    }
    case types.GEO_COMPASS_HEADING_STOP: {
      return {
        ...state,
        compass: {
          ...state.compass,
          heading: 0,
          enabled: false,
        },
      };
    }
    case types.GEO_COMPASS_HEADING_STOPPED: {
      return {
        ...state,
        compass: initialState.compass,
      };
    }
    case types.GEO_COMPASS_HEADING_UPDATE: {
      return {
        ...state,
        compass: {
          ...state.compass,
          heading: payload,
        },
      };
    }
    case types.GEO_COMPASS_HEADING_UNAVAILABLE: {
      return {
        ...state,
        compass: {
          heading: 0,
          enabled: false,
        },
      };
    }
    case types.GEO_COMPASS_UNKNOWN_ERROR: {
      return {
        ...state,
        compass: {
          heading: 0,
          enabled: false,
          error: payload,
        },
      };
    }
    default: {
      return state;
    }
  }
};

