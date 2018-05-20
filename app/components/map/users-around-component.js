import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import UserOnMapMarker from './user-on-map-marker';

const mapStateToProps = (state) => ({
  usersAround: state.usersAround.users,
  mapPanel: state.mapPanel,
  findUser: state.findUser,
  mapViewBearingAngle: state.mapView.heading,
});

type Props = {
  usersAround: Array<mixed>,
  dispatch: Dispatch,
  mapPanel: any,
  findUser: any,
  mapViewBearingAngle: number,
};

class UsersAroundComponent extends React.Component<Props> {
  onPress = (user) => {
    if (this.props.findUser.enabled) {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_SHOW',
        payload: {
          mode: 'findUserActive',
          user,
        },
      });
    } else {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_SHOW',
        payload: {
          mode: 'userCard',
          user,
        },
      });
    }
  }

  onDeselected = () => {
    if (this.props.mapPanel.visible) {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_HIDE',
        payload: {
          source: 'userAround-onDeselected',
        },
      });
    }
  }

  renderUsersAround() {
    return this.props.usersAround.map((user) => (
      <MapboxGL.PointAnnotation
        coordinate={[
          user.geoPoint.longitude,
          user.geoPoint.latitude,
        ]}
        key={user.uid}
        id={user.uid}
        // onSelected={() => { this.onPress(user); }}
        onDeselected={() => { this.onDeselected(); }}
        selected={false}
      >
        <UserOnMapMarker
          onPress={() => { this.onPress(user); }}
          title={user.shortId && user.shortId.substring(0, 1).toUpperCase()}
          heading={user.heading}
          mapViewBearingAngle={this.props.mapViewBearingAngle}
        />
      </MapboxGL.PointAnnotation>
    ));
  }

  render() {
    return (
      <React.Fragment>
        {this.renderUsersAround()}
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps)(UsersAroundComponent);
