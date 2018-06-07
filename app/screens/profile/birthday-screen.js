import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';

import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2, Body } from '../../components/ui-kit/typography';

const birthdayIcon = require('../../assets/icons/birthday/birthday.png');

type Props = {
  navigation: any,
};

export default class BirthdayScreen extends Component<Props> {
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
            source={birthdayIcon}
            style={styles.topImage}
          />
          <H2 style={styles.header}>Твоя дата рождения?</H2>
          <Body style={styles.subHeader}>Сервис только для{'\n'}совершеннолетних</Body>
          <DaterButton
            onPress={() => this.props.navigation.navigate('RegisterUploadPhoto')}
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
  subHeader: {
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    textAlign: 'center',
  },
});
