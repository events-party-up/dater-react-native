import React, { Component } from 'react';

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
        <DaterTextInput
          placeholder="Enter your phone..."
          keyboardType="phone-pad"
          returnKeyType="go"
        />
        <DaterTextInput
          placeholder="Enter your name..."
          returnKeyType="next"
        />
      </DaterModal>
    );
  }
}
