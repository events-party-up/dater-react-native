import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  acceptTS: Date,
  distance: number,
  onPressStop: () => void,
  onPressShowMeTarget: () => void,
}

export default class MapPanelActiveMicroDate extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>Встреча с{' '}
          {this.props.targetUser.name}
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Началась{' '}
          <Moment locale="ru" element={Caption2} fromNow>{this.props.acceptTS}</Moment>.{'\n'}
          Расстояние {Math.floor(this.props.distance)} м.{' '}
        </Caption2>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >
          <DaterButton
            style={[MapPanelStyles.panelButton, { width: 130 }]}
            onPress={this.props.onPressStop}
          >
            Отменить
          </DaterButton>
          <DaterButton
            style={[MapPanelStyles.panelButton, { width: 130 }]}
            onPress={this.props.onPressShowMeTarget}
          >
            Найти
          </DaterButton>
        </View>
      </View>
    );
  }
}
