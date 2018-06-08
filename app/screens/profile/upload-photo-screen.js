import React, { Component } from 'react';
import {
  StyleSheet,
  Image,
} from 'react-native';

import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2, Body } from '../../components/ui-kit/typography';

const uploadPhotoIcon = require('../../assets/icons/upload-photo/upload-photo.png');

type Props = {
  navigation: any,
};

export default class UploadPhotoScreen extends Component<Props> {
  navigationFlowType: string;

  componentWillMount() {
    this.navigationFlowType = this.props.navigation.getParam('navigationFlowType');
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
          source={uploadPhotoIcon}
          style={styles.topImage}
        />
        <H2 style={styles.header}>Загрузи фото</H2>
        <Body style={styles.subHeader}>Выбери портрет{'\n'}хорошего качества</Body>
        <DaterButton
          onPress={() => this.props.navigation.navigate('RegisterProfile')}
          style={styles.button}
        >
          Загрузить
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
    marginBottom: 16,
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    textAlign: 'center',
    marginBottom: 8,
  },
  button: {
    alignSelf: 'center',
    position: 'absolute',
    width: 150,
    bottom: 32,
  },
});
