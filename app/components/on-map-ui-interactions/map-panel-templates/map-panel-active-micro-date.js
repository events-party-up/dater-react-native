import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  acceptTS: Date,
  distance: number,
}

export default class MapPanelActiveMicroDate extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >
          Встреча с {this.props.targetUser.name}
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Началась{' '}
          <Moment locale="ru" element={Caption2} fromNow>{this.props.acceptTS}</Moment>.{'\n'}
          Расстояние {Math.floor(this.props.distance)} м.
        </Caption2>
      </View>
    );
  }
}
