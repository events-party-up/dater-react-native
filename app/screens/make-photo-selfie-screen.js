import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import SystemSetting from 'react-native-system-setting';

import DaterModal from '../components/ui-kit/dater-modal';
import CircleButton from '../components/ui-kit/circle-button';
import IconTitleSubtitleMolecule from '../components/ui-kit/molecules/icon-title-subtitle';

const takePhotoIcon = require('../assets/icons/take-photo/take-photo-white.png');
const noCameraIcon = require('../assets/icons/no-camera/no-camera.png');

type Props = {
  navigation: any,
};

type State = {
  faces: [],
  photoURI: string,
}

export default class MakePhotoSelfieScreen extends Component<Props, State> {
  camera: RNCamera;
  styles: typeof StyleSheet;
  volumeListener: any;
  isCameraReady = false;

  constructor(props: any) {
    super(props);
    this.state = {
      faces: [],
      photoURI: '',
    };
  }

  componentWillMount() {
    this.volumeListener = SystemSetting.addVolumeListener(() => {
      this.takePicture();
    });
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
        ...this.state,
        photoURI: data.uri,
      });
    }
  };
  onCameraReady = () => {
    console.log('Camera is ready');
    this.isCameraReady = true;
  }

  onMountError = (error) => {
    console.log(error);
  }

  onFacesDetected = ({ faces }) => this.setState({ faces });

  onFaceDetectionError = (error) => console.log(error);

  renderNotAuthorized = () => (
    <IconTitleSubtitleMolecule
      icon={noCameraIcon}
      header="Нет доступа к камере"
      subheader={'Вы отклонили запрос\nна доступ \n к камере телефона'}
      style={styles.preview}
    />
  );

  onBackButton = () => {
    if (this.state.photoURI) {
      this.setState({
        ...this.state,
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

  render() {
    return (
      <DaterModal
        fullscreen
        backButton={this.state.photoURI === '' || false}
        backButtonPress={() => this.onBackButton()}
        confirmButton={this.state.photoURI !== '' || false}
        confirmButtonPress={this.state.photoURI === '' ? false : () => this.setState({
          ...this.state,
          photoURI: '',
        })}

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
            permissionDialogTitle="Please allow access to cameral"
            permissionDialogMessage="Needed to take selfie or adding photo to your profile."
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
          {this.state.photoURI === '' &&
            <CircleButton
              image={takePhotoIcon}
              onPress={() => this.takePicture()}
              style={styles.takePhotoButton}
            />
          }
          {this.state.photoURI !== '' &&
            <CircleButton
              onPress={() => this.setState({
                ...this.state,
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

});
