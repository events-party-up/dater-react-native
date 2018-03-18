import { geoActionCreators } from '../redux/index';

const GEO_OPTIONS = {
  useSignificantChanges: false,
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 1000,
  distanceFilter: 1,
};

export default function watchGeoPosition(dispatch): number {
  this.watchId = navigator.geolocation.watchPosition(
    (position) => {
      dispatch(geoActionCreators.geoUpdated(position.coords));
    },
    (error) => dispatch(geoActionCreators.geoDenied(error)),
    GEO_OPTIONS,
  );
  return this.watchId;
}

export const getGeoPosition = (dispatch) => {
  navigator.geolocation.watchPosition(
    (position) => {
      dispatch(geoActionCreators.geoUpdated(position.coords));
    },
    (error) => dispatch(geoActionCreators.geoDenied(error)),
    GEO_OPTIONS,
  );
};
