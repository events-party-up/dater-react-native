import React from 'react';
import { View } from 'react-native';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import MapPanelStyles from './map-panel-styles';

type Props = {
  mapPanel: any,
}

export default class MapPanelMakeSelfie extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader} numberOfLines={1} >Сделай селфи!
        </H2>
        {this.props.mapPanel.targetUser &&
          <Caption2 style={MapPanelStyles.panelBody}>
            Ты уже совсем близко к {this.props.mapPanel.targetUser.name}!{'\n'}
            Чтобы завершить, сделайте совместное селфи.
          </Caption2>
        }
      </View>
    );
  }
}
