import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import { calculateAgeFrom } from '../../../utils/date-utils';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  distance: number,
  onPressDecline: () => void,
  onPressAccept: () => void,
}

export default class MapPanelIncomingMicroDateRequest extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>
          Запрос от {this.props.targetUser.name} {this.props.targetUser.birthday &&
            calculateAgeFrom(this.props.targetUser.birthday)}
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          Расстояние {Math.floor(this.props.distance)} м.{'\n'}
          User ID: {this.props.targetUser.shortId}{' '}
        </Caption2>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >
          <DaterButton
            style={[MapPanelStyles.panelButton, { width: 130 }]}
            onPress={this.props.onPressDecline}
          >
            Отклонить
          </DaterButton>
          <DaterButton
            style={[MapPanelStyles.panelButton, { width: 130 }]}
            onPress={this.props.onPressAccept}
          >
            Принять
          </DaterButton>
        </View>
      </View>
    );
  }
}
