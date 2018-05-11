import * as React from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import DaterModal from '../components/ui-kit/dater-modal';
import DaterButton from '../components/ui-kit/dater-button';
import { H1, Body, Caption2 } from '../components/ui-kit/typography';

const bgImage = require('../assets/images/login-screen/login-selfie.jpg');

type Props = {
  navigation: any,
};

export default class LoginScreen extends React.Component<Props> {
  signIn = () => {
    console.log('Signing in');
  }

  render() {
    return (
      <DaterModal
        fullscreen
        closeButtonPress={() => this.props.navigation.goBack(null)}
        bgImage={bgImage}
        style={styles.modal}
      >
        <View style={styles.headersContainer}>
          <View style={styles.topDividier} />
          <H1 style={styles.header}>Dater</H1>
          <Body style={styles.subHeader}>Играй и влюбляйся!</Body>
        </View>
        <View style={styles.footerContainer}>
          <DaterButton
            style={styles.button}
            onPress={() => this.props.navigation.navigate('LoginPhone')}
            type="secondary"
          >
            Номер Телефона
          </DaterButton>
          <Caption2 style={styles.footer}>Конфиденциальность | Правила использования</Caption2>
        </View>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  headersContainer: {
    flex: 1,
  },
  topDividier: {
    height: 320,
  },
  header: {
    color: '#FFFFFF',
  },
  subHeader: {
    color: '#FFFFFF',
    marginBottom: 32,
  },
  button: {
    alignSelf: 'center',
    marginBottom: 32,
    width: 300,
  },
  footerContainer: {
    justifyContent: 'flex-end',
    height: 200,
  },
  footer: {
    color: '#FFFFFF',
    alignSelf: 'center',
    marginBottom: 18,
  },
});
