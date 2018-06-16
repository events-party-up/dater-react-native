import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../components/ui-kit/atoms/typography';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { calculateAgeFrom } from '../../utils/date-utils';
import MapPanelStyles from './map-panel-styles';
import { MicroDate } from '../../types';

type Props = {
  targetUser: any,
  distance: number,
  onPressStop: () => void,
  onPressShowMeTarget: () => void,
  microDateId: MicroDate,
}

export default class MapPanelActiveMicroDate extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>Встеча с{' '}
          {this.props.targetUser.name} {this.props.targetUser.birthday &&
            calculateAgeFrom(this.props.targetUser.birthday)}
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Расстояние {Math.floor(this.props.distance)} м.{' '}
          Date ID: {this.props.microDateId && this.props.microDateId.substring(0, 4)}{' '}
          User ID: ({this.props.targetUser.id.substring(0, 4)} )
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
