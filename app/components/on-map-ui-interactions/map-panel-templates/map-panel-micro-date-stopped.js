import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  stopTS: Date,
}

export default class MapPanelMicroDateStopped extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Встреча отменена :(
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          {this.props.targetUser.name} отменил{this.props.targetUser.gender === 'female' && 'а'} встречу {' '}
          <Moment locale="ru" element={Caption2} fromNow>{this.props.stopTS}</Moment>.
        </Caption2>
      </View>
    );
  }
}
