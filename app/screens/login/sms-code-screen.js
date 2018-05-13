import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';

import DaterTextInput from '../../components/ui-kit/atoms/dater-text-input';
import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/dater-button';
import { H2 } from '../../components/ui-kit/typography';

const smsCodeIcon = require('../../assets/icons/sms-code/sms-code.png');

type Props = {
  navigation: any,
};

export default class SmsCodeScreen extends Component<Props> {
  render() {
    return (
      <DaterModal
        fullscreen
        backButton
        backButtonPress={() => this.props.navigation.goBack()}
        style={styles.modal}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          scrollEnabled={false}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContainer}
        >
          <Image
            source={smsCodeIcon}
            style={styles.topImage}
          />
          <H2 style={styles.header}>Введи код из SMS</H2>
          <DaterTextInput
            placeholder="XXXX"
            keyboardType="numeric"
            returnKeyType="go"
            style={styles.input}
          />
          <DaterButton
            onPress={() => this.props.navigation.navigate('RegisterGender')}
          >
            Далее
          </DaterButton>
        </ScrollView>
      </DaterModal>
    );
  }
}


const styles = StyleSheet.create({
  modal: {
  },
  scrollView: {
    alignSelf: 'center',
  },
  scrollViewContainer: {
    alignItems: 'center',
  },
  topImage: {
    marginTop: 64,
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    textAlign: 'center',
  },
});
