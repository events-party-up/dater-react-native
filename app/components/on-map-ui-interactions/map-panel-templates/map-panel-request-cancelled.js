import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import CircleButton from '../../../components/ui-kit/atoms/circle-button';
// import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  onPressClose: () => void,
}

export default class MapPanelRequestCancelled extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>
          Запрос на встречу отменен :(
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          {this.props.targetUser.name} отменил{this.props.targetUser.gender === 'female' && 'а'} запрос на встречу.
        </Caption2>
        {/* <DaterButton style={MapPanelStyles.panelButton} onPress={this.props.onPressClose}>
          ОК
        </DaterButton> */}
        <CircleButton type="close" onPress={this.props.onPressClose} size="large" style={{ alignSelf: 'center' }} />

      </View>
    );
  }
}
