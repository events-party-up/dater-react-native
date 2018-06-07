import React, { Component } from 'react';
import {
  ScrollView,
  StyleSheet,
  Image,
} from 'react-native';

import DaterTextInput from '../../components/ui-kit/atoms/dater-text-input';
import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2 } from '../../components/ui-kit/typography';

const nameIcon = require('../../assets/icons/name/name.png');

type Props = {
  navigation: any,
};

export default class NameScreen extends Component<Props> {
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
            source={nameIcon}
            style={styles.topImage}
          />
          <H2 style={styles.header}>Твое имя?</H2>
          <DaterTextInput
            placeholder="Например: Андрей или Юля"
            returnKeyType="next"
            style={styles.input}
          />
          <DaterButton
            onPress={() => this.props.navigation.navigate('RegisterBirthday')}
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
    width: 300,
  },
});
