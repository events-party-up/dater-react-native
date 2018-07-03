import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import CircleButton from '../../../components/ui-kit/atoms/circle-button';
// import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';

const takePhotoIcon = require('../../../assets/icons/take-photo/take-photo-white.png');

type Props = {
  mapPanel: any,
  onPressOpenCamera: () => void,
}

export default class MapPanelMakeSelfie extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>Сделай селфи!
        </H2>
        {this.props.mapPanel.targetUser &&
          <Caption2 style={MapPanelStyles.panelBody}>
            Ты уже совсем близко к {this.props.mapPanel.targetUser.name}!{'\n'}
            Чтобы завершить, сделайте совместное селфи.
          </Caption2>
        }
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-evenly',
          }}
        >
          {/* {this.props.stopMicroDate && // TODO: remove this
            <DaterButton
              style={[MapPanelStyles.panelButton, { width: 130 }]}
              onPress={this.props.stopMicroDate}
            >
              Остановить
            </DaterButton>
          } */}
          <CircleButton
            onPress={this.props.onPressOpenCamera}
            // size="medium-big"
            image={takePhotoIcon}
            style={{
              alignContent: 'center',
              shadowColor: '#4F4F4F',
              backgroundColor: '#4F4F4F',
            }}
          />

          {/* <DaterButton
            style={[MapPanelStyles.panelButton]}
            onPress={this.props.onPressOpenCamera}
          >
            Камера
          </DaterButton> */}
        </View>
      </View>
    );
  }
}
