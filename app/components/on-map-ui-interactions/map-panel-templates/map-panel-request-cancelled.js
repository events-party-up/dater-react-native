import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
}

export default class MapPanelRequestCancelled extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Запрос на встречу отменен :(
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          {this.props.targetUser.name} отменил{this.props.targetUser.gender === 'female' && 'а'} запрос на встречу.
        </Caption2>
      </View>
    );
  }
}
