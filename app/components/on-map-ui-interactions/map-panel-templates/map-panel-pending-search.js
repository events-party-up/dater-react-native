import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
}

export default class MapPanelPendingSearch extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Идет поиск пары...
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Dater можно закрыть, как только пара будет найдена, ты получишь уведомление.
        </Caption2>
      </View>
    );
  }
}
