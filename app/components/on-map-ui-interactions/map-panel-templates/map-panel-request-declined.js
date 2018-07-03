import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  declineTS: Date,
  onPressClose: () => void,
}

export default class MapPanelRequestDeclined extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>
          Запрос отклонен :(
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          {this.props.targetUser.name} отклонил{this.props.targetUser.gender === 'female' && 'а'} запрос на встречу{' '}
          <Moment locale="ru" element={Caption2} fromNow>{this.props.declineTS}</Moment>.
        </Caption2>
        <DaterButton style={MapPanelStyles.panelButton} onPress={this.props.onPressClose}>
          ОК
        </DaterButton>
      </View>
    );
  }
}
