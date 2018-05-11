import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import DaterTextInput from '../../components/ui-kit/atoms/dater-text-input';
import DaterModal from '../../components/ui-kit/dater-modal';

type Props = {
  navigation: any,
};

export default class TextInputsScreen extends Component<Props> {
  render() {
    return (
      <DaterModal
        fullscreen
        backButton
        backButtonPress={() => this.props.navigation.goBack()}
        headerTitle="Text Inputs"
      >
        <View style={styles.row}>
          <DaterTextInput
            placeholder="Enter your phone..."
            keyboardType="phone-pad"
            returnKeyType="go"
          />
        </View>
        <View style={styles.row}>
          <DaterTextInput
            placeholder="Enter your name..."
            returnKeyType="next"
          />
        </View>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
});
