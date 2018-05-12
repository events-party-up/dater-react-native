import React, { Component } from 'react';
import { ScrollView } from 'react-native';

import DaterTextInput from '../../components/ui-kit/atoms/dater-text-input';
import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/dater-button';

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
        keyboardShouldPersistTaps="handled"
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
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
          <DaterButton
            onPress={() => this.props.navigation.navigate('LoginPhone')}
          >
            Далее
          </DaterButton>
        </ScrollView>
      </DaterModal>
    );
  }
}
