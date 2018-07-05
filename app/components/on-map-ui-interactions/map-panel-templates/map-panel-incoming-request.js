import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import { calculateAgeFrom } from '../../../utils/date-utils';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  distance: number,
  requestTS: Date,
}

export default class MapPanelIncomingRequest extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Запрос от {this.props.targetUser.name} {this.props.targetUser.birthday &&
            calculateAgeFrom(this.props.targetUser.birthday)}
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Отправлен {' '}
          <Moment locale="ru" element={Caption2} fromNow>
            {this.props.requestTS}
          </Moment>.{'\n'}
          Расстояние {Math.floor(this.props.distance)} м.
        </Caption2>
      </View>
    );
  }
}
