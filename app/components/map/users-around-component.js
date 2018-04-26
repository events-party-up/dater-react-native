import * as React from 'react';
import { connect, Dispatch } from 'react-redux';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import PersonMaker from './person-maker';

const mapStateToProps = (state) => ({
  usersAround: state.usersAround.users,
  mapPanel: state.mapPanel,
  findUser: state.findUser,
});

type Props = {
  usersAround: Array<mixed>,
  dispatch: Dispatch,
  mapPanel: any,
  findUser: any,
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

  onSelected = (user) => {
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
        onDeselected={() => { this.onDeselected(); }}
        selected={false}
      >
        <PersonMaker
          onPress={() => { this.onPress(user); }}
          title={user.shortId}
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
