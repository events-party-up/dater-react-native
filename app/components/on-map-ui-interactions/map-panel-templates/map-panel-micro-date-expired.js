import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';
import { TIME_TO_FINISH_MICRO_DATE } from '../../../constants';

type Props = {
  targetUser: any,
}

export default class MapPanelMicroDateExpired extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Время на встречу вышло
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Ты и {this.props.targetUser.name} не успели встретиться в течении {' '}
          {TIME_TO_FINISH_MICRO_DATE / 1000 / 60} минут.
        </Caption2>
      </View>
    );
  }
}
