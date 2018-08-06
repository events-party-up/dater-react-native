import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
  mapPanel: string,
  usersAroundCount: number,
  usersAroundReadyToDateCount: number,
}

export default class MapPanelAreYouReady extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Ты готов{this.props.mapPanel.gender === 'female' && 'а'} к встрече?
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Игроков поблизости: {this.props.usersAroundCount}{'\n'}
          Готовых встретиться сейчас: {this.props.usersAroundReadyToDateCount}
        </Caption2>
      </View>
    );
  }
}
