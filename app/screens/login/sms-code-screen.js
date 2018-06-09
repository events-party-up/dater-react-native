import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import {
  ScrollView,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';

import DaterTextInput from '../../components/ui-kit/atoms/dater-text-input';
import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2 } from '../../components/ui-kit/typography';

const smsCodeIcon = require('../../assets/icons/sms-code/sms-code.png');

const mapStateToProps = (state) => ({
  wrongSmsCode: state.auth.wrongSmsCode,
  verifySmsCodeTimeout: state.auth.verifySmsCodeTimeout,
});

type State = {
  isCodeValid: boolean,
  inProgress: boolean,
}

type Props = {
  navigation: any,
  dispatch: Dispatch,
};

class SmsCodeScreen extends Component<Props, State> {
  smsCode: string;
  textInput: any;

  constructor(props) {
    super(props);

    this.state = {
      isCodeValid: false,
      inProgress: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.wrongSmsCode || nextProps.verifySmsCodeTimeout) {
      this.textInput.textInput.clear();
      this.setState({
        isCodeValid: false,
        inProgress: false,
      });
      this.smsCode = '';
    }
  }

  backButtonPress = () => {
    this.props.navigation.goBack();
    this.props.dispatch({ type: 'AUTH_PHONE_NUMBER_SMS_CODE_SCREEN_BACK_BUTTON' });
  }

  onChangeInput = (smsCode) => {
    this.smsCode = smsCode;
    this.setState({
      isCodeValid: this.isCodeValid(),
    });
  }

  isCodeValid() {
    return this.smsCode.length === 6;
  }

  onSmsCodeSubmit = () => {
    this.setState({
      inProgress: true,
    });
    this.smsCode = this.smsCode.replace(/\D/g, ''); // remove non numbers
    this.props.dispatch({
      type:
        'AUTH_PHONE_NUMBER_SMS_CODE_SUBMITTED',
      payload: {
        smsCode: this.smsCode,
      },
    });
  }

  onInvalidCodeSubmit = () => {
    Alert.alert(
      'Неверный код',
      'Введи корректный код из СМС, 6 цифр',
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
        backButtonPress={this.backButtonPress}
        style={styles.modal}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled" // if 'none' the button's first action will dismiss keyboard, instead of submitting
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
            ref={(component) => { this.textInput = component; }}
            placeholder="XXXXXX"
            keyboardType="numeric"
            returnKeyType="go"
            style={styles.input}
            onChangeText={this.onChangeInput}
            maxLength={6}
            autoFocus
          />
          <DaterButton
            onPress={this.onSmsCodeSubmit}
            disabled={!this.state.isCodeValid || this.state.inProgress}
            onDisabledPress={this.onInvalidCodeSubmit}
            inProgress={this.state.inProgress}
          >
            {this.state.inProgress ? 'Проверка...' : 'Далее'}
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

export default connect(mapStateToProps)(SmsCodeScreen);
