import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';
import { TIME_TO_RESPOND_TO_MICRO_DATE_REQUEST } from '../../../constants';

type Props = {
  targetUser: any,
}

export default class MapPanelRequestExpired extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>
          Время на ответ вышло
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Ты не успел ответить на запрос о встрече с {this.props.targetUser.name} в течении{' '}
          {TIME_TO_RESPOND_TO_MICRO_DATE_REQUEST / 1000 / 60} минут.
        </Caption2>
      </View>
    );
  }
}
