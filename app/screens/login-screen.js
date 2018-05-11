import * as React from 'react';

import {
  StyleSheet,
  View,
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
  signIn = () => {
    console.log('Signing in');
  }

  render() {
    return (
      <ImageBackground
        style={styles.bgImage}
        source={bgImage}
        resizeMethod="cover"
        resizeMode="cover"
      >
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
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    backgroundColor: 'transparent',
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
    width: width - 32,
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
