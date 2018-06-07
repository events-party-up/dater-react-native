import * as React from 'react';
import { connect, Dispatch } from 'react-redux';

import {
  StyleSheet,
  View,
  Text,
  Image,
  Platform,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import SystemSetting from 'react-native-system-setting';
import Permissions from 'react-native-permissions';
import RNANAndroidSettingsLibrary from 'react-native-android-settings-library';

import DaterModal from '../components/ui-kit/dater-modal';
import CircleButton from '../components/ui-kit/circle-button';
import IconTitleSubtitleMolecule from '../components/ui-kit/molecules/icon-title-subtitle';
import DaterButton from '../components/ui-kit/atoms/dater-button';
import { PhotoType } from '../types';

const takePhotoIcon = require('../assets/icons/take-photo/take-photo-white.png');
const noCameraIcon = require('../assets/icons/no-camera/no-camera.png');

const mapStateToProps = (state) => ({
  uploadPhotos: state.uploadPhotos,
});

type Props = {
  navigation: any,
  dispatch: Dispatch,
};

type State = {
  faces: [],
  photoURI: string,
  hasCameraPermission: boolean,
  width: number,
  height: number,
}

class MakePhotoSelfieScreen extends React.Component<Props, State> {
  camera: RNCamera;
  styles: typeof StyleSheet;
  volumeListener: any;
  photoType: PhotoType;

  constructor(props: any) {
    super(props);
    this.state = {
      faces: [],
      photoURI: '',
      hasCameraPermission: false,
      width: 0,
      height: 0,
    };
  }

  async componentWillMount() {
    this.volumeListener = SystemSetting.addVolumeListener(() => {
      this.takePicture();
    });

    const cameraPermission = await Permissions.check('camera');
    if (cameraPermission === 'authorized') {
      this.setState({
        hasCameraPermission: true,
      });
    }
    this.photoType = this.props.navigation.getParam('photoType');
  }

  onCameraReady = () => {
    this.setState({
      hasCameraPermission: true,
    });
  }

  onMountError = (error) => {
    console.log(error);
  }

  componentWillUnmount() {
    SystemSetting.removeVolumeListener(this.volumeListener);
  }

  takePicture = async () => {
    if (this.camera && this.state.photoURI === '') {
      const options = {
        quality: 0.75,
        base64: false,
        mirrorImage: true,
      };
      const data = await this.camera.takePictureAsync(options);
      this.setState({
        photoURI: data.uri,
        ...data,
      });
    }
  };

  onFacesDetected = ({ faces }) => this.setState({ faces });

  onFaceDetectionError = (error) => console.log(error);

  renderNotAuthorized = () => (
    <View style={styles.preview}>
      <IconTitleSubtitleMolecule
        icon={noCameraIcon}
        header="Нет доступа к камере"
        subheader={'Вы отклонили запрос\nна доступ \n к камере телефона'}
      />
      <DaterButton
        style={styles.settingsButton}
        onPress={Platform.OS === 'ios' ?
          Permissions.openSettings :
          () => RNANAndroidSettingsLibrary.open('ACTION_APPLICATION_DETAILS_SETTINGS')}
      >
        Настройки
      </DaterButton>
    </View>
  );

  onBackButton = () => {
    if (this.state.photoURI) {
      this.setState({
        photoURI: '',
      });
    } else {
      this.props.navigation.goBack();
    }
  }

  renderFaces() {
    return (
      <View style={styles.facesContainer} pointerEvents="none">
        {this.state.faces.map(renderFace)}
      </View>
    );
  }

  uploadPhoto = () => {
    this.props.dispatch({
      type: 'UPLOAD_PHOTO_START',
      payload: {
        type: this.photoType,
        uri: this.state.photoURI,
        aspectRatio: this.state.width / this.state.height,
      },
    });

    if (this.props.photoType === 'microDateSelfie') {
      this.props.navigation.goBack();
    } else {
      this.props.navigation.popToTop();
      this.props.navigation.goBack(null);
    }
  }

  render() {
    return (
      <DaterModal
        fullscreen
        backButton={this.state.photoURI === '' || false}
        backButtonPress={() => this.onBackButton()}
        confirmButton={this.state.photoURI !== '' || false}
        confirmButtonPress={this.state.photoURI === '' ? false : () => this.uploadPhoto()}

        style={styles.container}
      >
        {!this.state.photoURI &&
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            style={styles.preview}
            type={RNCamera.Constants.Type.front}
            flashMode={RNCamera.Constants.FlashMode.auto}
            // onFacesDetected={this.onFacesDetected}
            // onFaceDetectionError={this.onFaceDetectionError}
            permissionDialogTitle="Пожалуйста, разрешите доступ к камере"
            permissionDialogMessage={'Доступ к камере нужен для съемки селфи ' +
            'в конце встречи и добавления фото в ваш профиль.'}
            notAuthorizedView={this.renderNotAuthorized()}
            onCameraReady={() => this.onCameraReady()}
            onMountError={this.onMountError}
          >
            {this.renderFaces()}
          </RNCamera>
        }
        {this.state.photoURI !== '' &&
          <Image
            style={styles.preview}
            source={{ uri: this.state.photoURI }}
          />
        }
        <View style={styles.bottomButtonsContainer}>
          {this.state.photoURI === '' && this.state.hasCameraPermission &&
            <CircleButton
              image={takePhotoIcon}
              onPress={() => this.takePicture()}
              style={styles.takePhotoButton}
            />
          }
          {this.state.photoURI !== '' &&
            <CircleButton
              onPress={() => this.setState({
                photoURI: '',
              })}
              style={styles.removePhotoButton}
              type="close"
            />
          }
        </View>
      </DaterModal>
    );
  }
}

function renderFace({
  bounds,
  faceID,
  rollAngle,
  yawAngle,
}) {
  return (
    <View
      key={faceID}
      transform={[
        { perspective: 600 },
        { rotateZ: `${rollAngle.toFixed(0)}deg` },
        { rotateY: `${yawAngle.toFixed(0)}deg` },
      ]}
      style={[
        styles.face,
        {
          ...bounds.size,
          left: bounds.origin.x,
          top: bounds.origin.y,
        },
      ]}
    >
      <Text style={styles.faceText}>ID: {faceID}</Text>
      <Text style={styles.faceText}>rollAngle: {rollAngle.toFixed(0)}</Text>
      <Text style={styles.faceText}>yawAngle: {yawAngle.toFixed(0)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    backgroundColor: 'white',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  bottomButtonsContainer: {
    height: 96,
    bottom: 0,
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: 'rgba(0, 0, 0, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  takePhotoButton: {
    alignContent: 'center',
    // backgroundColor: '#fff',
    shadowColor: '#4F4F4F',
    backgroundColor: '#4F4F4F',
  },
  removePhotoButton: {
    alignContent: 'center',
  },
  noCameraTopImage: {
    alignSelf: 'center',
    marginTop: 128,
  },
  settingsButton: {
    marginTop: 16,
  },

});

export default connect(mapStateToProps)(MakePhotoSelfieScreen);
