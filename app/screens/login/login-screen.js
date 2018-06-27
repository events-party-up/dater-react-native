import * as React from 'react';

import {
  StyleSheet,
  ImageBackground,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

import DaterModal from '../../components/ui-kit/organisms/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H1, Body, Caption2 } from '../../components/ui-kit/atoms/typography';
import { width } from '../../constants';

const bgImage = require('../../assets/images/login-screen/login-selfie.jpg');
const signInIcon = require('../../assets/icons/sign-in/sign-in.png');

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
        <LinearGradient
          colors={['rgba(229, 228, 234, 0)', 'rgba(32, 33, 79, 0.5)']}
          style={styles.linearGradient}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 0, y: 1 }}
        >
          <DaterModal
            fullscreen
            closeButtonPress={() => this.props.navigation.goBack(null)}
            style={styles.modal}
          >
            <H1 style={styles.header}>Dater</H1>
            {/* <Body style={styles.subHeader}>Играй и влюбляйся!</Body> */}
            {/* <Body style={styles.subHeader}>Живи сейчас, встречайся сейчас!</Body> */}
            <Body style={styles.subHeader}>Играй и знакомься!</Body>
            <DaterButton
              style={styles.button}
              onPress={() =>
                this.props.navigation.navigate({ key: 'PhoneNumberScreen', routeName: 'PhoneNumberScreen' })}
              type="secondary"
              leftIconImage={signInIcon}
            >
              Войти
            </DaterButton>
            <Caption2 style={styles.footer}>Конфиденциальность | Правила использования</Caption2>
          </DaterModal>
        </LinearGradient>
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
  linearGradient: {
    backgroundColor: 'transparent',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
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
