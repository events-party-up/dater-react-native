import { Dimensions } from 'react-native';
import MapView from 'react-native-maps';

import GeoUtils from '../utils';

const { width, height } = Dimensions.get('window');
const ASPECT_RATIO = width / height;
const DEFAULT_LATITUDE_DELTA = 0.00322;
const DEFAULT_LONGITUDE_DELTA = DEFAULT_LATITUDE_DELTA * ASPECT_RATIO;

const types = {
  MAPVIEW_REGION_UPDATED: 'MAPVIEW_REGION_UPDATED',
  MAPVIEW_ANIMATE_TO_REGION: 'MAPVIEW_ANIMATE_TO_REGION',
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
  const visibleRadiusInMeters = GeoUtils.distance(center, corner);

  return {
    type: types.MAPVIEW_REGION_UPDATED,
    payload: {
      ...region,
      visibleRadiusInMeters,
    },
  };
};

const mapViewAnimateToRegion = (mapView: MapView, region) => (dispatch) => {
  mapView.animateToRegion(region, 500);

  dispatch({
    type: types.MAPVIEW_ANIMATE_TO_REGION,
    payload: region,
  });
};


export const mapViewActionCreators = {
  mapViewRegionUpdate,
  mapViewAnimateToRegion,
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
    case types.MAPVIEW_ANIMATE_TO_REGION: {
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
