import { Dimensions } from 'react-native';

import GeoUtils from '../utils';

const types = {
  MAPVIEW_REGION_UPDATED: 'MAPVIEW_REGION_UPDATED',
  MAPVIEW_ANIMATE_TO_REGION: 'MAPVIEW_ANIMATE_TO_REGION',
  MAPVIEW_ANIMATE_TO_COORDINATE: 'MAPVIEW_ANIMATE_TO_COORDINATE',
  MAPVIEW_ROTATE: 'MAPVIEW_ROTATE',
  MAPVIEW_READY: 'MAPVIEW_READY',
  MAPVIEW_INIT_REGION_ERROR: 'MAPVIEW_INIT_REGION_ERROR',
  MAPVIEW_MAINSAGA_ERROR: 'MAPVIEW_MAINSAGA_ERROR',
};

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const DEFAULT_LATITUDE_DELTA = 0.00322;
const DEFAULT_LONGITUDE_DELTA = DEFAULT_LATITUDE_DELTA * ASPECT_RATIO;

const initialState = {
  latitudeDelta: DEFAULT_LATITUDE_DELTA,
  longitudeDelta: DEFAULT_LONGITUDE_DELTA,
  visibleRadiusInMeters: 410,
  rotationAngle: 0,
  mapReady: false,
};

const mapViewReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.MAPVIEW_REGION_UPDATED: {
      const center = {
        latitude: payload.newRegion.latitude,
        longitude: payload.newRegion.longitude,
      };
      const corner = {
        latitude: center.latitude + payload.newRegion.latitudeDelta,
        longitude: payload.newRegion.longitude + payload.newRegion.longitudeDelta,
      };
      const visibleRadiusInMeters = GeoUtils.distance(center, corner);

      return {
        ...state,
        ...payload.newRegion,
        visibleRadiusInMeters,
      };
    }
    case types.MAPVIEW_ANIMATE_TO_REGION: {
      return {
        ...state,
        ...payload.region,
      };
    }
    case types.MAPVIEW_ANIMATE_TO_COORDINATE: {
      return {
        ...state,
        ...payload.coords,
      };
    }
    case types.MAPVIEW_ROTATE: {
      return {
        ...state,
        rotationAngle: payload.rotationAngle,
      };
    }
    case types.MAPVIEW_READY: {
      return {
        ...state,
        mapReady: true,
      };
    }
    case types.MAPVIEW_INIT_REGION_ERROR:
    case types.MAPVIEW_MAINSAGA_ERROR: {
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

export default mapViewReducer;
