import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  StyleSheet,
  Image,
  ScrollView,
  View,
} from 'react-native';

import DaterModal from '../../components/ui-kit/dater-modal';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import { H2 } from '../../components/ui-kit/typography';
import cloudinaryUrl from '../../utils/cloudinary-utils';
import { PrivateUserRecord } from '../../types';
import { SCREEN_WIDTH } from '../../constants';
import { calculateAgeFrom, ageWithTextPostfix } from '../../utils/date-utils';
import CardInfoItemMolecule from '../../components/ui-kit/molecules/card-info-item-molecule';
import EditCardItemAtom from '../../components/ui-kit/atoms/edit-card-item-atom';

const mapStateToProps = (state) => ({
  uploadPhotos: state.uploadPhotos,
  currentUser: state.currentUser,
});

type Props = {
  navigation: any,
  currentUser: PrivateUserRecord,
  uploadPhotos: any,
};

class ProfileScreen extends Component<Props> {
  onPress = () => {
    this.props.navigation.popToTop();
    this.props.navigation.goBack(null);
  }

  // TODO: implement upload in progress

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
            !this.props.uploadPhotos.running &&
            <Image
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
          {this.props.uploadPhotos.uri && this.props.uploadPhotos.running &&
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
            onPress={
              () => this.props.navigation.navigate(
                'RegisterMakePhotoSelfie',
                {
                  navigationFlowType: 'editProfile',
                  photoType: 'profilePhoto',
                },
              )
            }
            type="secondary"
            style={styles.photoButton}
          >
            Сменить фото
          </DaterButton>

          <H2 style={styles.header}>
            {this.props.currentUser.name} {' '}
            <EditCardItemAtom
              style={{
                padding: 4,
              }}
              onPress={() => this.props.navigation.navigate('RegisterName', { navigationFlowType: 'editProfile' })}
            />
            {ageWithTextPostfix(calculateAgeFrom(this.props.currentUser.birthday), ['год', 'года', 'лет'])} {' '}
            <EditCardItemAtom
              style={{
                padding: 4,
              }}
              onPress={() => this.props.navigation.navigate('RegisterBirthday', { navigationFlowType: 'editProfile' })}
            />
          </H2>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            header="Пол:"
          >
            {this.props.currentUser.gender === 'male' ? 'Мужчина' : 'Девушка'}
            <EditCardItemAtom
              onPress={() => this.props.navigation.navigate('RegisterGender', { navigationFlowType: 'editProfile' })}
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
