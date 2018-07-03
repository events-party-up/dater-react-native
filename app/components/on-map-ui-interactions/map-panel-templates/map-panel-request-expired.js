import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import CircleButton from '../../../components/ui-kit/atoms/circle-button';
// import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';
import { TIME_TO_RESPOND_TO_MICRO_DATE_REQUEST } from '../../../constants';

type Props = {
  targetUser: any,
  onPressClose: () => void,
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
        {/* <DaterButton style={MapPanelStyles.panelButton} onPress={this.props.onPressClose}>
          ОК
        </DaterButton> */}
        <CircleButton type="close" onPress={this.props.onPressClose} size="large" style={{ alignSelf: 'center' }} />

      </View>
    );
  }
}
