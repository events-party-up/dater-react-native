import React, { Component } from 'react';
import {
  StyleSheet,
  Image,
} from 'react-native';

import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/dater-button';
import { H2 } from '../../components/ui-kit/typography';

const genderIcon = require('../../assets/icons/gender/gender.png');

type Props = {
  navigation: any,
};

export default class GenderScreen extends Component<Props> {
  render() {
    return (
      <DaterModal
        fullscreen
        backButton
        backButtonPress={() => this.props.navigation.goBack()}
        style={styles.modal}
      >
        <Image
          source={genderIcon}
          style={styles.topImage}
        />
        <H2 style={styles.header}>Кто ты?</H2>
        <DaterButton
          onPress={() => this.props.navigation.navigate('RegisterName')}
          style={styles.button}
        >
          Я Мужчина
        </DaterButton>
        <DaterButton
          onPress={() => this.props.navigation.navigate('RegisterName')}
          style={styles.button}
        >
          Я Девушка
        </DaterButton>
      </DaterModal>
    );
  }
}


const styles = StyleSheet.create({
  modal: {
  },
  topImage: {
    alignSelf: 'center',
    marginTop: 128,
  },
  header: {
    textAlign: 'center',
    marginBottom: 32,
  },
  button: {
    alignSelf: 'center',
    marginBottom: 16,
  },
});
