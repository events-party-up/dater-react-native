import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import {
  StyleSheet,
  Image,
} from 'react-native';

import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2 } from '../../components/ui-kit/typography';

const genderIcon = require('../../assets/icons/gender/gender.png');

const mapStateToProps = () => ({
});

type Props = {
  dispatch: Dispatch,
  navigation: any,
};

class GenderScreen extends Component<Props> {
  onGenderSelected = (gender: string) => {
    this.props.dispatch({ type: 'CURRENT_USER_SET_PROFILE_FIELDS', payload: { gender } });
    this.props.navigation.navigate('RegisterName');
  }

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
          onPress={() => this.onGenderSelected('male')}
          style={styles.button}
        >
          Я Мужчина
        </DaterButton>
        <DaterButton
          onPress={() => this.onGenderSelected('female')}
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

export default connect(mapStateToProps)(GenderScreen);
