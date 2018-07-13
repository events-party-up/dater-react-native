import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
  mapPanel: string,
}

export default class MapPanelAreYouReady extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Ты готов{this.props.mapPanel.gender === 'female' && 'а'} к встрече?
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Рядом с тобой 5 игроков готовых встретиться прямо сейчас.
        </Caption2>
      </View>
    );
  }
}
