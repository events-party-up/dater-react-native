import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import DaterButton from '../../components/ui-kit/dater-button';
import DaterModal from '../../components/ui-kit/dater-modal';
import { DaterHeader } from '../../components';

type Props = {
  navigation: any,
};

export default class UIKitIndexScreen extends Component<Props> {
  render() {
    return (
      <DaterModal fullscreen closeButton closeButtonPress={() => this.props.navigation.goBack(null)}>
        <DaterHeader>
          UI Kit Collection
        </DaterHeader>
        <View style={styles.row}>
          <DaterButton type="main" onPress={() => this.props.navigation.navigate('Buttons')}>
            Buttons
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="main" onPress={() => this.props.navigation.navigate('Typography')}>
            Typography
          </DaterButton>
        </View>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingBottom: 16,
    justifyContent: 'center',
  },
});
