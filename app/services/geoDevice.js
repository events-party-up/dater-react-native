import { geoActionCreators } from '../redux/index';

const GEO_OPTIONS = {
  useSignificantChanges: false,
  enableHighAccuracy: true,
  timeout: 20000,
  maximumAge: 1000,
};

export default function watchGeoPosition(dispatch): number {
  this.watchId = navigator.geolocation.watchPosition(
    async (position) => {
      await dispatch(geoActionCreators.geoUpdated(position.coords));
      // const queryArea = {
      //   center: {
      //     latitude: position.coords.latitude,
      //     longitude: position.coords.longitude,
      //   },
      //   radius: 25,
      // };
      // if (!this.unsubscribeFromUsersAround) {
      //   console.log('Attach a listener for users around');
      //   this.unsubscribeFromUsersAround = listenForUsersAround(queryArea, this.props.dispatch);
      // }
    },
    (error) => this.props.dispatch(geoActionCreators.geoDenied(error)),
    GEO_OPTIONS,
  );
  return this.watchId;
}
