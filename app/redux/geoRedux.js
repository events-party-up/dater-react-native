import firebase from 'react-native-firebase';
import { Dimensions } from 'react-native'

import { getUsersAroundOnce, listenForUsersAround, distance } from "../services/geoQuery";

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const DEFAULT_LATITUDE_DELTA = 0.00322;
const DEFAULT_LONGITUDE_DELTA = DEFAULT_LATITUDE_DELTA * ASPECT_RATIO;

const types = {
  GEO_UPDATED: 'GEO_UPDATED',
  GEO_MAPVIEW_UPDATED: 'GEO_MAPVIEW_UPDATED',
  GEO_PERMISSION_REQUESTED: 'GEO_PERMISSION_REQUESTED',
  GEO_PERMISSION_GRANTED: 'GEO_PERMISSION_GRANTED',
  GEO_PERMISSION_DENIED: 'GEO_PERMISSION_DENIED',
}

const geoUpdated = (coords) => async (dispatch, getState) => {
  const uid = getState().auth.uid;

  if (uid !== null) {
    await firebase.firestore().collection('geoPoints').doc(uid).update({
      accuracy: coords.accuracy,
      geoPoint: new firebase.firestore.GeoPoint(coords.latitude, coords.longitude),
      timestamp: firebase.firestore.FieldValue.serverTimestamp(),
    })
      // .then(() => console.log('Successfully updated geo data'))
      .catch(error => console.error(error));
  }

  dispatch({
    type: types.GEO_UPDATED,
    payload: coords
  });
}
const geoRequest = () => {
  return {
    type: types.GEO_PERMISSION_REQUESTED,
  }
}

const geoGranted = (coords) => {
  return {
    type: types.GEO_PERMISSION_GRANTED,
    payload: coords,
  }
}

const geoDenied= (error) => {
  return {
    type: types.GEO_PERMISSION_DENIED,
    payload: error,
  }
}

const geoMapViewUpdated = (region) => {
  const center = {
    latitude: region.latitude,
    longitude: region.longitude,
  };
  const corner = {
    latitude: center.latitude + region.latitudeDelta,
    longitude: region.longitude + region.longitudeDelta,
  }
  const visibleRadiusInMeters = distance(center, corner);
  region.visibleRadiusInMeters = visibleRadiusInMeters;
  return {
    type: types.GEO_MAPVIEW_UPDATED,
    payload: region,
  }
}

export const geoActionCreators = {
  geoUpdated,
  geoRequest,
  geoGranted,
  geoDenied,
  geoMapViewUpdated,
}

const initialState = {
  coords: {
    latitude: 55.751244,
    longitude: 37.618423,
    accuracy: 800,
  },
  mapView: {
    latitudeDelta: DEFAULT_LATITUDE_DELTA,
    longitudeDelta: DEFAULT_LONGITUDE_DELTA,
    visibleRadiusInMeters: 410,
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
    case types.GEO_MAPVIEW_UPDATED: {
      return {
        ...state,
        mapView: {
          latitudeDelta: payload.latitudeDelta,
          longitudeDelta: payload.longitudeDelta,
          visibleRadiusInMeters: payload.visibleRadiusInMeters,
        },
      }
    }
    default: {
      return state
    }
  }
}
