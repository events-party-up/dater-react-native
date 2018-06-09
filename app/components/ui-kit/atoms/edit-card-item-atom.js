import * as React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import * as _ from 'lodash';

import { BUTTONS_ONPRESS_THROTTLE_THRESHOLD } from '../../../constants';

const editItemIcon = require('../../../assets/icons/edit-profile-item/edit-profile-item.png');

type Props = {
  style: typeof StyleSheet,
  onPress: () => void,
};

export default class EditCardItemAtom extends React.Component<Props> {
  onPressThrottled;
  componentWillMount() {
    this.onPressThrottled = _.throttle(this.onPress, BUTTONS_ONPRESS_THROTTLE_THRESHOLD);
  }

  onPress = () => {
    if (this.props.onPress) {
      this.props.onPress();
    }
  };

  render() {
    return (
      <TouchableOpacity
        style={[styles.editItemIcon, this.props.style]}
        onPress={this.onPressThrottled}
        hitSlop={{
          top: 10,
          bottom: 10,
          left: 10,
          right: 10,
        }}
      >
        <Image source={editItemIcon} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  editItemIcon: {
    paddingLeft: 8,
  },
});
