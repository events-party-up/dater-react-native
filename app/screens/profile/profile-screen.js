import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import {
  StyleSheet,
  Image,
  ScrollView,
  View,
  TouchableOpacity,
} from 'react-native';
import ImageLoad from 'react-native-image-placeholder';

import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2 } from '../../components/ui-kit/typography';
import cloudinaryUrl from '../../utils/cloudinary-utils';
import { PrivateUserRecord } from '../../types';
import { SCREEN_WIDTH } from '../../constants';
import { calculateAgeFrom, ageWithTextPostfix } from '../../utils/date-utils';
import CardInfoItemMolecule from '../../components/ui-kit/molecules/card-info-item-molecule';
import EditCardItemAtom from '../../components/ui-kit/atoms/edit-card-item-atom';

const signOutIcon = require('../../assets/icons/sign-out/sign-out.png');

const mapStateToProps = (state) => ({
  uploadPhotos: state.uploadPhotos,
  currentUser: state.currentUser,
});

type Props = {
  navigation: any,
  currentUser: PrivateUserRecord,
  uploadPhotos: any,
  dispatch: Dispatch,
};

class ProfileScreen extends Component<Props> {
  onPress = () => {
    this.props.navigation.popToTop();
    this.props.navigation.goBack(null);
  }

  onChangePhotoPress = () => {
    this.props.navigation.navigate({
      key: 'EditProfilePhoto',
      routeName: 'RegisterMakePhotoSelfie',
      params: {
        navigationFlowType: 'editProfile',
        photoType: 'profilePhoto',
      },
    });
  }

  onPressLogout = () => {
    this.props.navigation.popToTop();
    this.props.navigation.goBack(null);
    this.props.dispatch({
      type: 'AUTH_SIGNOUT',
    });
  }

  render() {
    return (
      <DaterModal
        fullscreen
        style={styles.modal}
        confirmButtonPress={this.onPress}
        confirmButton
      >
        <ScrollView
          style={styles.scrollViewContainer}
        >
          {this.props.currentUser.mainPhoto &&
            !this.props.uploadPhotos.uri &&
            <ImageLoad
              loadingStyle={{ size: 'large', color: 'gray' }}
              style={{
                width: SCREEN_WIDTH,
                height: 336,
                alignSelf: 'center',
                paddingBottom: 8,
                marginBottom: 16,
              }}
              source={{
                uri: cloudinaryUrl({
                  publicId: this.props.currentUser.mainPhoto.publicId,
                  version: this.props.currentUser.mainPhoto.version,
                }, {
                    width: SCREEN_WIDTH,
                    height: '336',
                    // crop: 'fill',
                    crop: 'lfill',
                    gravity: 'auto:face',
                  }),
              }}
            />
          }
          {this.props.uploadPhotos.uri &&
            <Image
              style={{
                width: SCREEN_WIDTH,
                height: 336,
                alignSelf: 'center',
                paddingBottom: 8,
                marginBottom: 16,
              }}
              source={{
                uri: this.props.uploadPhotos.uri,
              }}
            />
          }
          <DaterButton
            onPress={this.onChangePhotoPress}
            type="secondary"
            style={styles.photoButton}
          >
            Сменить фото
          </DaterButton>
          <TouchableOpacity
            onPress={this.onPressLogout}
            style={{
              width: 24,
              height: 24,
              position: 'absolute',
              top: 32,
              right: 8,
            }}
          >
            <Image
              style={{
                width: 24,
                height: 24,
              }}
              source={signOutIcon}
            />
          </TouchableOpacity>

          <H2 style={styles.header}>
            {this.props.currentUser.name} {' '}
            <EditCardItemAtom
              style={{
                padding: 4,
              }}
              onPress={() =>
                this.props.navigation.navigate({
                  key: 'EditProfileName',
                  routeName: 'RegisterName',
                  params: { navigationFlowType: 'editProfile' },
                })}
            />
            {this.props.currentUser.birthday &&
              ageWithTextPostfix(calculateAgeFrom(this.props.currentUser.birthday), ['год', 'года', 'лет'])} {' '}
            <EditCardItemAtom
              style={{
                padding: 4,
              }}
              onPress={() =>
                this.props.navigation.navigate({
                  key: 'EditProfileBirthday',
                  routeName: 'RegisterBirthday',
                  params: { navigationFlowType: 'editProfile' },
                })}
            />
          </H2>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            header="Пол:"
          >
            {this.props.currentUser.gender === 'male' ? 'Мужчина' : 'Девушка'}
            <EditCardItemAtom
              onPress={() =>
                this.props.navigation.navigate({
                  key: 'EditProfileGender',
                  routeName: 'RegisterGender',
                  params: { navigationFlowType: 'editProfile' },
                })}
            />
          </CardInfoItemMolecule>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            header="ID Пользователя:"
          >
            {this.props.currentUser.uid}
          </CardInfoItemMolecule>
          <View style={styles.bottomButtonsPad} />
        </ScrollView>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    paddingLeft: 0,
    paddingTop: 0,
    paddingRight: 0,
  },
  scrollViewContainer: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  header: {
    textAlign: 'left',
    paddingLeft: 16,
    marginBottom: 8,
  },
  photoButton: {
    position: 'absolute',
    top: 333 - 16 - 48,
    right: 16,
    width: 150,
  },
  bodyText: {
    marginBottom: 8,
  },
  textBodyPadding: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  bottomButtonsPad: {
    height: 96,
  },
});

export default connect(mapStateToProps)(ProfileScreen);
