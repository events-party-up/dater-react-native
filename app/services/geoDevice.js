import { geoActionCreators } from '../redux/index';

const GEO_OPTIONS = {
  useSignificantChanges: false,
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 1000,
  distanceFilter: 1,
};

export const watchGeoPosition = (dispatch): number => {
  const watchId = navigator.geolocation.watchPosition(
    (position) => {
      dispatch(geoActionCreators.geoUpdated(position.coords));
    },
    (error) => dispatch(geoActionCreators.geoDenied(error)),
    GEO_OPTIONS,
  );
  return watchId;
};

export const getGeoPosition = (dispatch) => {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      dispatch(geoActionCreators.geoUpdated(position.coords));
    },
    (error) => dispatch(geoActionCreators.geoDenied(error)),
    GEO_OPTIONS,
  );
};
