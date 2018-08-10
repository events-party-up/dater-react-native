import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
}

export default class MapPanelIAmReadyExpired extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Никто не найден :(
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Рядом с тобой никого нет. Попробуй позже или в другом месте.
        </Caption2>
      </View>
    );
  }
}
