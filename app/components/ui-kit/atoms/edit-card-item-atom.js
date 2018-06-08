import * as React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';

const editItemIcon = require('../../../assets/icons/edit-profile-item/edit-profile-item.png');

type Props = {
  style: typeof StyleSheet,
  onPress: () => void,
};

export default class EditCardItemAtom extends React.Component<Props> {
  render() {
    return (
      <TouchableOpacity
        style={[styles.editItemIcon, this.props.style]}
        onPress={this.props.onPress}
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
