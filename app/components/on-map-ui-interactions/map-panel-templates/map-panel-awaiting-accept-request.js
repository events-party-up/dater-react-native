import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
// import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';
import CircleButton from '../../../components/ui-kit/atoms/circle-button';

type Props = {
  targetUser: any,
  requestTS: Date,
  onPressCancel: () => void,
}

export default class MapPanelAwaitingAcceptRequest extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>Ожидание ответа</H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Запрос на встречу с {this.props.targetUser.name}.{'\n'}
          Отправлен{' '}
          <Moment locale="ru" element={Caption2} fromNow>{this.props.requestTS}</Moment>.
        </Caption2>
        {/* <DaterButton
          style={MapPanelStyles.panelButton}
          onPress={this.props.onPressCancel}
        >
          Отменить
        </DaterButton> */}
        <CircleButton type="decline" onPress={this.props.onPressCancel} size="large" style={{ alignSelf: 'center' }} />
      </View>
    );
  }
}
