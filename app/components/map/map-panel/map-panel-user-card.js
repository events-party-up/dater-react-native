import React from 'react';
import { View } from 'react-native';
import Moment from 'react-moment';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import { calculateAgeFrom } from '../../../utils/date-utils';
import MapPanelStyles from './map-panel-styles';

type Props = {
  mapPanel: any,
  onPress: () => void,
}

export default class MapPanelUserCard extends React.Component<Props> {
  render() {
    return (
      <View>
        <H2 style={MapPanelStyles.panelHeader}>
          {this.props.mapPanel.targetUser.name} {this.props.mapPanel.targetUser.birthday &&
            calculateAgeFrom(this.props.mapPanel.targetUser.birthday)}
        </H2>
        <Caption2 style={MapPanelStyles.panelBody}>
          {Math.floor(this.props.mapPanel.targetUser.distance)} метров от вас. {' '}
          Был{' '}
          <Moment locale="ru" element={Caption2} fromNow>
            {this.props.mapPanel.targetUser.timestamp}
          </Moment>.{'\n'}
          User ID: ({this.props.mapPanel.targetUser.id.substring(0, 4)} )
        </Caption2>
        <DaterButton
          style={MapPanelStyles.panelButton}
          onPress={this.props.onPress}
        >
          Встретиться
        </DaterButton>
      </View>
    );
  }
}
