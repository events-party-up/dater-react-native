import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  requestTS: Date,
}

export default class MapPanelAwaitingAcceptRequest extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >Ожидание ответа</H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Запрос на встречу с {this.props.targetUser.name}.{'\n'}
          Отправлен{' '}
          <Moment locale="ru" element={Caption2} fromNow>{this.props.requestTS}</Moment>.
        </Caption2>
      </View>
    );
  }
}
