import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import {
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';

import DaterTextInput from '../../components/ui-kit/atoms/dater-text-input';
import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/dater-button';
import { H2 } from '../../components/ui-kit/typography';

const phoneIcon = require('../../assets/icons/phone/phone.png');

const mapStateToProps = (state) => ({
  auth: state.auth,
});

type Props = {
  navigation: any,
  dispatch: Dispatch,
};

class PhoneNumberScreen extends Component<Props> {
  phoneNumber: string = '+16505553434';

  onPhoneSubmit = () => {
    const phoneNumbers = this.phoneNumber.replace(/\D/g, ''); // remove non numbers
    let phoneNumberFinal;

    if (phoneNumbers.length === 10) {
      phoneNumberFinal = `+7${phoneNumbers}`;
    } else if (phoneNumbers.length === 11 && /^7.*/.test(phoneNumbers)) {
      phoneNumberFinal = `+${phoneNumbers}`;
    } else if (phoneNumbers.length === 11 && /^8.*/.test(phoneNumbers)) {
      phoneNumberFinal = `+7${phoneNumbers.substring(1, 11)}`;
    } else {
      phoneNumberFinal = `+${phoneNumbers}`;
    }
    this.props.dispatch({ type: 'AUTH_PHONE_NUMBER_VERIFY', payload: { phoneNumber: phoneNumberFinal } });
  }

  onChangeInput = (phoneNumber) => {
    this.phoneNumber = phoneNumber;
  }

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
            source={phoneIcon}
            style={styles.topImage}
          />
          <H2 style={styles.header}>Твой номер{'\n'}телефона?</H2>
          <DaterTextInput
            placeholder="8 (926) 333 22 11"
            keyboardType="phone-pad"
            returnKeyType="go"
            style={styles.input}
            onChangeText={this.onChangeInput}
          />
          <DaterButton
            onPress={this.onPhoneSubmit}
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

export default connect(mapStateToProps)(PhoneNumberScreen);
