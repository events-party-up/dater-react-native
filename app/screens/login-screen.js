import * as React from 'react';

import {
  StyleSheet,
  ImageBackground,
} from 'react-native';

import DaterModal from '../components/ui-kit/dater-modal';
import DaterButton from '../components/ui-kit/dater-button';
import { H1, Body, Caption2 } from '../components/ui-kit/typography';
import { width } from '../constants';

const bgImage = require('../assets/images/login-screen/login-selfie.jpg');

type Props = {
  navigation: any,
};

export default class LoginScreen extends React.Component<Props> {
  render() {
    return (
      <ImageBackground
        style={styles.bgImage}
        source={bgImage}
        resizeMode="cover"
      >
        <DaterModal
          fullscreen
          closeButtonPress={() => this.props.navigation.goBack(null)}
          style={styles.modal}
        >
          <H1 style={styles.header}>Dater</H1>
          <Body style={styles.subHeader}>Играй и влюбляйся!</Body>
          <DaterButton
            style={styles.button}
            onPress={() => this.props.navigation.navigate('LoginPhone')}
            type="secondary"
          >
            Войти
          </DaterButton>
          <Caption2 style={styles.footer}>Конфиденциальность | Правила использования</Caption2>
        </DaterModal>
      </ImageBackground>
    );
  }
}

const styles = StyleSheet.create({
  bgImage: {
    flex: 1,
    // remove width and height to override fixed static size
    width: null,
    height: null,
  },
  modal: {
    justifyContent: 'flex-end',
    alignItems: 'flex-start',
    backgroundColor: 'transparent',
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
    width: width - 32,
    borderWidth: 0,
    marginBottom: 32,
  },
  footer: {
    color: '#FFFFFF',
    alignSelf: 'center',
    marginBottom: 18,
  },
});
