import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import CircleButton from '../../../components/ui-kit/atoms/circle-button';
// import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelStyles from './map-panel-styles';

type Props = {
  targetUser: any,
  stopTS: Date,
  onPressClose: () => void,
}

export default class MapPanelMicroDateStopped extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>
          Встреча отменена :(
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          {this.props.targetUser.name} отменил{this.props.targetUser.gender === 'female' && 'а'} встречу {' '}
          <Moment locale="ru" element={Caption2} fromNow>{this.props.stopTS}</Moment>.
        </Caption2>
        <CircleButton type="close" onPress={this.props.onPressClose} size="large" style={{ alignSelf: 'center' }} />

        {/* <DaterButton style={MapPanelStyles.panelButton} onPress={this.props.onPressClose}>
          ОК
        </DaterButton> */}
      </View>
    );
  }
}
