import { Dimensions } from 'react-native';

import { distance } from '../services/geoQuery';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const DEFAULT_LATITUDE_DELTA = 0.00322;
const DEFAULT_LONGITUDE_DELTA = DEFAULT_LATITUDE_DELTA * ASPECT_RATIO;

const types = {
  MAPVIEW_REGION_UPDATED: 'MAPVIEW_REGION_UPDATED',
};

const mapViewRegionUpdate = (region) => {
  const center = {
    latitude: region.latitude,
    longitude: region.longitude,
  };
  const corner = {
    latitude: center.latitude + region.latitudeDelta,
    longitude: region.longitude + region.longitudeDelta,
  };
  const visibleRadiusInMeters = distance(center, corner);

  return {
    type: types.MAPVIEW_REGION_UPDATED,
    payload: {
      ...region,
      visibleRadiusInMeters,
    },
  };
};

export const mapViewActionCreators = {
  mapViewRegionUpdate,
};

const initialState = {
  latitudeDelta: DEFAULT_LATITUDE_DELTA,
  longitudeDelta: DEFAULT_LONGITUDE_DELTA,
  visibleRadiusInMeters: 410,
};

export const reducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.MAPVIEW_REGION_UPDATED: {
      return {
        ...state,
        ...payload,
      };
    }
    default: {
      return state;
    }
  }
};
