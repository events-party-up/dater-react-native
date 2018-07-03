import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import CircleButton from '../../../components/ui-kit/atoms/circle-button';
// import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';
import { TIME_TO_FINISH_MICRO_DATE } from '../../../constants';

type Props = {
  targetUser: any,
  onPressClose: () => void,
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
        {/* <DaterButton style={MapPanelStyles.panelButton} onPress={this.props.onPressClose}>
          ОК
        </DaterButton> */}
        <CircleButton type="close" onPress={this.props.onPressClose} size="large" style={{ alignSelf: 'center' }} />
      </View>
    );
  }
}
