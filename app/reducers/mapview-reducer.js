import GeoUtils from '../utils/geo-utils';
import {
  DEFAULT_LATITUDE_DELTA,
  DEFAULT_LONGITUDE_DELTA,
} from '../constants';

const types = {
  MAPVIEW_REGION_UPDATED: 'MAPVIEW_REGION_UPDATED',
  MAPVIEW_ANIMATE_TO_REGION: 'MAPVIEW_ANIMATE_TO_REGION',
  MAPVIEW_ANIMATE_TO_COORDINATE: 'MAPVIEW_ANIMATE_TO_COORDINATE',
  MAPVIEW_ANIMATE_TO_BEARING_MANUALLY: 'MAPVIEW_ANIMATE_TO_BEARING_MANUALLY',
  MAPVIEW_ANIMATE_TO_BEARING_COMPASS_HEADING: 'MAPVIEW_ANIMATE_TO_BEARING_COMPASS_HEADING',
  MAPVIEW_ANIMATE_TO_BEARING_GPS_HEADING: 'MAPVIEW_ANIMATE_TO_BEARING_GPS_HEADING',
  MAPVIEW_READY: 'MAPVIEW_READY',
  MAPVIEW_UNLOAD: 'MAPVIEW_UNLOAD',
  MAPVIEW_MAIN_SAGA_READY: 'MAPVIEW_MAIN_SAGA_READY',
  MAPVIEW_INIT_REGION_ERROR: 'MAPVIEW_INIT_REGION_ERROR',
  MAPVIEW_MAINSAGA_ERROR: 'MAPVIEW_MAINSAGA_ERROR',
  MAPVIEW_ANIMATE_TO_BEARING_ERROR: 'MAPVIEW_ANIMATE_TO_BEARING_ERROR',
  MAPVIEW_ANIMATE_TO_REGION_ERROR: 'MAPVIEW_ANIMATE_TO_REGION_ERROR',
  MAPVIEW_ANIMATE_TO_COORDINATE_ERROR: 'MAPVIEW_ANIMATE_TO_COORDINATE_ERROR',
  MAPVIEW_DRAG_START: 'MAPVIEW_DRAG_START',
  MAPVIEW_SHOW_MY_LOCATION_START: 'MAPVIEW_SHOW_MY_LOCATION_START',
  MAPVIEW_SHOW_MY_LOCATION_FINISH: 'MAPVIEW_SHOW_MY_LOCATION_FINISH',
  MAPVIEW_SHOW_MY_LOCATION_ERROR: 'MAPVIEW_SHOW_MY_LOCATION_ERROR',
  MAPVIEW_FIT_TO_COORDS_ERROR: 'MAPVIEW_FIT_TO_COORDS_ERROR',
  MAPVIEW_SHOW_ME_AND_TARTET_FIND_USER: 'MAPVIEW_SHOW_ME_AND_TARTET_FIND_USER',
};

const initialState = {
  longitude: null,
  latitude: null,
  latitudeDelta: DEFAULT_LATITUDE_DELTA,
  longitudeDelta: DEFAULT_LONGITUDE_DELTA,
  visibleRadiusInMeters: 410, // how much is map visible in meters by diagonal
  bearingAngle: 0, // how much the map is rotated compared to north
  mapReady: false, // has the map been loaded?
  centered: false, // should map be in centered mode?
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
        latitude: center.latitude + (payload.newRegion.latitudeDelta / 2),
        longitude: payload.newRegion.longitude + (payload.newRegion.longitudeDelta / 2),
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
    case types.MAPVIEW_ANIMATE_TO_BEARING_COMPASS_HEADING:
    case types.MAPVIEW_ANIMATE_TO_BEARING_GPS_HEADING:
    case types.MAPVIEW_ANIMATE_TO_BEARING_MANUALLY: {
      return {
        ...state,
        ...payload,
      };
    }
    case types.MAPVIEW_READY: {
      return {
        ...state,
        mapReady: true,
      };
    }
    case types.MAPVIEW_UNLOAD: {
      return {
        ...state,
        mapReady: false,
      };
    }
    case types.MAPVIEW_DRAG_START: {
      return {
        ...state,
        centered: false,
      };
    }
    case types.MAPVIEW_SHOW_MY_LOCATION_FINISH: {
      return {
        ...state,
        centered: true,
      };
    }
    case types.MAPVIEW_ANIMATE_TO_COORDINATE_ERROR:
    case types.MAPVIEW_SHOW_MY_LOCATION_ERROR:
    case types.MAPVIEW_ANIMATE_TO_REGION_ERROR:
    case types.MAPVIEW_ANIMATE_TO_BEARING_ERROR:
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
