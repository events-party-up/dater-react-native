import * as React from 'react';
import { Marker } from 'react-native-maps';
import { connect, Dispatch } from 'react-redux';

import PersonMaker from './person-maker';

const mapStateToProps = (state) => ({
  usersAround: state.usersAround.users,
  mapPanelIsVisible: state.mapPanel.visible,
});

type Props = {
  usersAround: Array<mixed>,
  dispatch: Dispatch,
  mapPanelIsVisible: boolean,
};

class UsersAroundComponent extends React.Component<Props> {
  onPersonMakerPress = (user) => {
    if (this.props.mapPanelIsVisible) {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_REPLACE_START',
        payload: {
          mode: 'userCard',
          data: user,
        },
      });
    } else {
      this.props.dispatch({
        type: 'UI_MAP_PANEL_SHOW_START',
        payload: {
          mode: 'userCard',
          data: user,
        },
      });
    }
  }

  renderUsersAround() {
    return this.props.usersAround.map((user) => (
      <Marker
        coordinate={{
          latitude: user.geoPoint.latitude,
          longitude: user.geoPoint.longitude,
        }}
        key={user.uid}
        onPress={(event) => { event.stopPropagation(); this.onPersonMakerPress(user); }}
      >
        <PersonMaker title={user.shortId} />
      </Marker>
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
