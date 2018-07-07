import GeoUtils from '../../utils/geo-utils';

const types = {
  MAPVIEW_READY: 'MAPVIEW_READY',
  MAPVIEW_UNLOAD: 'MAPVIEW_UNLOAD',
  MAPVIEW_INIT_REGION_ERROR: 'MAPVIEW_INIT_REGION_ERROR',

  MAPVIEW_MAIN_SAGA_READY: 'MAPVIEW_MAIN_SAGA_READY',
  MAPVIEW_MAINSAGA_ERROR: 'MAPVIEW_MAINSAGA_ERROR',

  MAPVIEW_DRAG_START: 'MAPVIEW_DRAG_START',
  MAPVIEW_DRAG_END: 'MAPVIEW_DRAG_END',

  MAPVIEW_REGION_CHANGED: 'MAPVIEW_REGION_CHANGED',

  MAPVIEW_SET_CAMERA: 'MAPVIEW_SET_CAMERA',
  MAPVIEW_SET_CAMERA_ERROR: 'MAPVIEW_SET_CAMERA_ERROR',

  MAPVIEW_ANIMATE_TO_HEADING_MANUALLY: 'MAPVIEW_ANIMATE_TO_HEADING_MANUALLY',
  MAPVIEW_ANIMATE_TO_HEADING_COMPASS_HEADING: 'MAPVIEW_ANIMATE_TO_HEADING_COMPASS_HEADING',
  MAPVIEW_ANIMATE_TO_HEADING_GPS_HEADING: 'MAPVIEW_ANIMATE_TO_HEADING_GPS_HEADING',
  MAPVIEW_ANIMATE_TO_HEADING_ERROR: 'MAPVIEW_ANIMATE_TO_HEADING_ERROR',

  MAPVIEW_MOVE_TO: 'MAPVIEW_MOVE_TO',
  MAPVIEW_MOVE_TO_ERROR: 'MAPVIEW_MOVE_TO_ERROR',
  MAPVIEW_MY_VISIBILITY_CHANGE: 'MAPVIEW_MY_VISIBILITY_CHANGE',

  MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME: 'MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME',
  MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME_FINISH: 'MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME_FINISH',
  MAPVIEW_SHOW_MY_LOCATION: 'MAPVIEW_SHOW_MY_LOCATION',
  MAPVIEW_SHOW_MY_LOCATION_FINISH: 'MAPVIEW_SHOW_MY_LOCATION_FINISH',
  MAPVIEW_SHOW_MY_LOCATION_ERROR: 'MAPVIEW_SHOW_MY_LOCATION_ERROR',

  MAPVIEW_SWITCH_VIEW_MODE_START: 'MAPVIEW_SWITCH_VIEW_MODE_START',
  MAPVIEW_SWITCH_VIEW_MODE_FINISH: 'MAPVIEW_SWITCH_VIEW_MODE_FINISH',
  MAPVIEW_SWITCH_VIEW_MODE_ERROR: 'MAPVIEW_SWITCH_VIEW_MODE_ERROR',

  MAPVIEW_MY_VISIBILITY_ERROR: 'MAPVIEW_MY_VISIBILITY_ERROR',
  MAPVIEW_FIT_TO_BOUNDS_ERROR: 'MAPVIEW_FIT_TO_BOUNDS_ERROR',
  MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE: 'MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE',
  MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE_ERROR: 'MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE_ERROR',
};

const initialState = {
  longitude: null,
  latitude: null,
  zoom: 17,
  visibleRadiusInMeters: 0, // how much is map visible in meters by diagonal
  heading: 0, // how much the map is rotated compared to north
  pitch: 0,
  visibleBounds: [],
  mapReady: false, // has the map been loaded?
  centered: true, // should map be in centered mode?
  modeIsSwitching: false,
  visibility: 'private',
};

const mapViewReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.MAPVIEW_REGION_CHANGED: {
      const { visibleBounds } = payload.properties;
      const corner1 = {
        longitude: visibleBounds[0][0],
        latitude: visibleBounds[0][1],
      };
      const corner2 = {
        longitude: visibleBounds[1][0],
        latitude: visibleBounds[1][1],
      };
      const visibleRadiusInMeters = Math.floor(GeoUtils.distance(corner1, corner2));

      return {
        ...state,
        longitude: payload.geometry.coordinates[0],
        latitude: payload.geometry.coordinates[1],
        heading: payload.properties.heading,
        pitch: payload.properties.pitch,
        zoom: payload.properties.zoomLevel,
        visibleBounds: payload.properties.visibleBounds,
        visibleRadiusInMeters,
      };
    }
    case types.MAPVIEW_SET_CAMERA: {
      return {
        ...state,
        ...payload,
      };
    }
    case types.MAPVIEW_ANIMATE_TO_HEADING_COMPASS_HEADING:
    case types.MAPVIEW_ANIMATE_TO_HEADING_GPS_HEADING:
    case types.MAPVIEW_ANIMATE_TO_HEADING_MANUALLY: {
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
    case types.MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME:
    case types.MAPVIEW_SWITCH_VIEW_MODE_START: {
      return {
        ...state,
        modeIsSwitching: true,
      };
    }
    case types.MAPVIEW_SWITCH_VIEW_MODE_FINISH: {
      return {
        ...state,
        modeIsSwitching: false,
      };
    }
    case types.MAPVIEW_UNLOAD: {
      return {
        ...state,
        mapReady: false,
      };
    }
    case types.MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE:
    case types.MAPVIEW_DRAG_START: {
      return {
        ...state,
        centered: false,
      };
    }
    case types.MAPVIEW_SHOW_MY_LOCATION_AND_CENTER_ME_FINISH: {
      return {
        ...state,
        centered: true,
        modeIsSwitching: false,
        mapViewSwitchMode: payload,
      };
    }
    case types.MAPVIEW_MY_VISIBILITY_CHANGE: {
      return {
        ...state,
        visibility: payload,
      };
    }
    case types.MAPVIEW_MY_VISIBILITY_ERROR:
    case types.MAPVIEW_SWITCH_VIEW_MODE_ERROR:
    case types.MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE_ERROR:
    case types.MAPVIEW_FIT_TO_BOUNDS_ERROR:
    case types.MAPVIEW_SHOW_MY_LOCATION_ERROR:
    case types.MAPVIEW_SET_CAMERA_ERROR:
    case types.MAPVIEW_ANIMATE_TO_HEADING_ERROR:
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
