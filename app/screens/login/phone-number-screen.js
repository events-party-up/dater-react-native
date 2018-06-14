import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import {
  ScrollView,
  StyleSheet,
  Image,
  Alert,
  Keyboard,
} from 'react-native';

import DaterTextInput from '../../components/ui-kit/atoms/dater-text-input';
import DaterModal from '../../components/ui-kit/organisms/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2 } from '../../components/ui-kit/atoms/typography';

const phoneIcon = require('../../assets/icons/phone/phone.png');

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,
  wrongPhoneNumber: state.auth.wrongPhoneNumber,
  sendSmsTimeout: state.auth.sendSmsTimeout,
});

type State = {
  isNumberValid: boolean,
  inProgress: boolean,
}

type Props = {
  navigation: any,
  dispatch: Dispatch,
  isAuthenticated: boolean,
};

class PhoneNumberScreen extends Component<Props, State> {
  phoneNumber: string; // = '+16505553434';
  phoneNumberOnlyNumbers: string; // = '+16505553434';
  phoneNumberFinal: string = '';
  phonePlaceholder = '8 926 333 22 11';

  constructor(props) {
    super(props);

    this.state = {
      isNumberValid: false,
      inProgress: false,
    };
  }

  componentDidMount() { // TODO: temporary route guard
    if (this.props.isAuthenticated) {
      this.props.navigation.navigate({ key: 'RegisterGender', routeName: 'RegisterGender' });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.wrongPhoneNumber || nextProps.sendSmsTimeout) {
      this.setState({
        isNumberValid: false,
        inProgress: false,
      });
    }
  }

  onPhoneSubmit = () => {
    if (this.phoneNumberOnlyNumbers.length === 10) {
      this.phoneNumberFinal = `+7${this.phoneNumberOnlyNumbers}`;
    } else if (this.phoneNumberOnlyNumbers.length === 11 && /^7.*/.test(this.phoneNumberOnlyNumbers)) {
      this.phoneNumberFinal = `+${this.phoneNumberOnlyNumbers}`;
    } else if (this.phoneNumberOnlyNumbers.length === 11 && /^8.*/.test(this.phoneNumberOnlyNumbers)) {
      this.phoneNumberFinal = `+7${this.phoneNumberOnlyNumbers.substring(1, 11)}`;
    } else {
      this.phoneNumberFinal = `+${this.phoneNumberOnlyNumbers}`;
    }
    Keyboard.dismiss();
    this.props.dispatch({ type: 'AUTH_PHONE_NUMBER_VERIFY', payload: { phoneNumber: this.phoneNumberFinal } });
    this.setState({
      inProgress: true,
    });
  }

  onChangeInput = (phoneNumber) => {
    this.phoneNumber = phoneNumber;
    this.phoneNumberOnlyNumbers = this.phoneNumber.replace(/\D/g, ''); // remove non numbers
    this.setState({
      isNumberValid: this.isPhoneValid(),
    });
  }

  isPhoneValid() {
    return this.phoneNumberOnlyNumbers.length >= 10;
  }

  onInvalidPhoneSubmit = () => {
    this.props.dispatch({ type: 'HAPTICFEEDBACK_ERROR' });
    Alert.alert(
      'Будь внимательней!',
      `Введи корректный номер телефона в формате \n${this.phonePlaceholder}`,
      [
        { text: 'Исправлюсь!' },
      ],
    );
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
          keyboardShouldPersistTaps="handled" // if 'none' the button's first action will dismiss keyboard, instead of submitting
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
            placeholder={this.phonePlaceholder}
            keyboardType="phone-pad"
            returnKeyType="go"
            style={styles.input}
            onChangeText={this.onChangeInput}
            maxLength={15}
            autoFocus
          />
          <DaterButton
            onPress={this.onPhoneSubmit}
            disabled={!this.state.isNumberValid || this.state.inProgress}
            onDisabledPress={this.onInvalidPhoneSubmit}
            inProgress={this.state.inProgress}
          >
            {this.state.inProgress ? 'Отправка СМС...' : 'Далее'}
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
