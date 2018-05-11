import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import DaterButton from '../../components/ui-kit/dater-button';
import DaterModal from '../../components/ui-kit/dater-modal';

type Props = {
  navigation: any,
};

export default class UIKitIndexScreen extends Component<Props> {
  render() {
    return (
      <DaterModal
        fullscreen
        closeButton
        closeButtonPress={() => this.props.navigation.goBack(null)}
        headerTitle="UI Kit Collection"
      >
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
        <View style={styles.row}>
          <DaterButton type="main" onPress={() => this.props.navigation.navigate('TextInputs')}>
            Text Inputs
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
