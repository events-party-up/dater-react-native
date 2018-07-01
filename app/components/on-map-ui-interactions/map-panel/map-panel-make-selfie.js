import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';

type Props = {
  mapPanel: any,
  onPressOpenCamera: () => void,
}

export default class MapPanelMakeSelfie extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>Сделайте совместное селфи!
        </H2>
        {this.props.mapPanel.targetUser &&
          <Caption2 style={MapPanelStyles.panelBody}>
            Ты уже совсем близко к {this.props.mapPanel.targetUser.name}!{'\n'}
            Для завершения встречи сделайте совместное селфи.
          </Caption2>
        }
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >
          {this.props.stopMicroDate &&
            <DaterButton
              style={[MapPanelStyles.panelButton, { width: 130 }]}
              onPress={this.props.stopMicroDate}
            >
              Остановить
            </DaterButton>
          }
          <DaterButton
            style={[MapPanelStyles.panelButton, { width: 130 }]}
            onPress={this.props.onPressOpenCamera}
          >
            Камера
          </DaterButton>
        </View>
      </View>
    );
  }
}
