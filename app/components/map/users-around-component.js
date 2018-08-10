import * as React from 'react';
import { Dispatch } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import UserOnMapMarker from './user-on-map-marker';
import GeoUtils from '../../utils/geo-utils';
import { FireStoreGeoPoint } from '../../types';

type Props = {
  usersAround: Array<mixed>,
  dispatch: Dispatch,
  mapViewBearingAngle: number,
  myCoords: FireStoreGeoPoint,
  isMicroDateMode: boolean,
};

export default class UsersAroundComponent extends React.Component<Props> {
  onPressOrSelect = (targetUser) => {
    this.props.dispatch({
      type: 'USERS_AROUND_ITEM_PRESSED',
      payload: {
        ...targetUser,
        distance: GeoUtils.distance(this.props.myCoords, targetUser.geoPoint),
      },
    });
  }

  onDeselected = () => {
    this.props.dispatch({ type: 'USERS_AROUND_ITEM_DESELECTED' });
  }

  renderUsersAround() {
    return this.props.usersAround.map((user) => (
      <MapboxGL.PointAnnotation
        coordinate={[
          user.geoPoint.longitude,
          user.geoPoint.latitude,
        ]}
        key={user.id}
        id={user.id}
        // onSelected={() => { this.onPressOrSelect(user); }} // TOOD: refactor this, onPress uses same callback
        // onDeselected={() => { this.onDeselected(); }}
        // selected={false}
        anchor={{ x: 0.5, y: 1 }} // anchor so that bottom tip of the marker is at the geo point
      >
        <UserOnMapMarker
          // onPress={() => { this.onPressOrSelect(user); }}
          title={user.name ?
            user.name.substring(0, 1).toUpperCase() :
            user.shortId && user.shortId.substring(0, 1).toUpperCase()}
          gender={user.gender}
          heading={user.heading}
          mapViewBearingAngle={this.props.mapViewBearingAngle}
          isMicroDateMode={this.props.isMicroDateMode}
          isReadyToDate={user.readyToDate}
        />
      </MapboxGL.PointAnnotation>
    ));
  }

  render() {
    return this.renderUsersAround();
  }
}
