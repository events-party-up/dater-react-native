import React, { Component } from 'react';
import {
  StyleSheet,
  Image,
} from 'react-native';

import DaterModal from '../../components/ui-kit/organisms/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2, Body } from '../../components/ui-kit/atoms/typography';
import { NavigationFlowType } from '../../types';
import DeviceUtils from '../../utils/device-utils';

// const uploadPhotoIcon = require('../../assets/icons/upload-photo/upload-photo.png');
const photoIcon = require('../../assets/icons/photo/photo-big.png');

type Props = {
  navigation: any,
};

export default class UploadPhotoScreen extends Component<Props> {
  navigationFlowType: NavigationFlowType;

  componentWillMount() {
    this.navigationFlowType = this.props.navigation.getParam('navigationFlowType');
  }

  onCameraPress = () => {
    this.props.navigation.navigate({
      key: 'MakePhotoSelfieScreen',
      routeName: 'MakePhotoSelfieScreen',
      params: { photoType: 'profilePhoto' },
    });
  }

  render() {
    return (
      <DaterModal
        fullscreen
        backButton={this.navigationFlowType === 'registration'}
        backButtonPress={() => this.props.navigation.goBack()}
        style={styles.modal}
      >
        <Image
          source={photoIcon}
          style={styles.topImage}
        />
        <H2 style={styles.header}>Сделай селфи</H2>
        <Body style={styles.subHeader}>
          Это нужно для подтверждения{'\n'}
          твоей личности и последующего{'\n'}
          начисления монет.{'\n'}{'\n'}
          Фото смогут увидеть только те,{'\n'}
          с кем ты уже встречался.{'\n'}
        </Body>
        <DaterButton
          onPress={this.onCameraPress}
          style={styles.button}
        >
          Камера
        </DaterButton>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  topImage: {
    alignSelf: 'center',
    marginTop: ((DeviceUtils.isiPhoneX() || DeviceUtils.isOfiPhonePlusSize()) && 128) ||
      (DeviceUtils.isOfiPhone6ExcludingPlusSize() && 64) || 32,
    marginBottom: 24,
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subHeader: {
    textAlign: 'center',
    marginBottom: 16,
  },
  button: {
    alignSelf: 'center',
  },
});
