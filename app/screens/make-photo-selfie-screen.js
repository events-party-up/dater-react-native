import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
} from 'react-native';
import { RNCamera } from 'react-native-camera';

import DaterModal from '../components/ui-kit/dater-modal';
import CircleButton from '../components/ui-kit/circle-button';

const takePhotoIcon = require('../assets/icons/take-photo/take-photo-white.png');

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

  constructor(props: any) {
    super(props);
    this.state = {
      faces: [],
      photoURI: '',
    };
  }

  takePicture = async () => {
    if (this.camera) {
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

  onFacesDetected = ({ faces }) => this.setState({ faces });

  onFaceDetectionError = (error) => console.log(error);

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
          >
            {this.renderFaces()}
          </RNCamera>
        }
        {this.state.photoURI &&
          <Image
            style={styles.preview}
            source={{ uri: this.state.photoURI }}
          />
        }
        <View style={styles.bottomButtonsContainer}>
          {!this.state.photoURI &&
            <CircleButton
              image={takePhotoIcon}
              onPress={() => this.takePicture()}
              style={styles.takePhotoButton}
            />
          }
          {this.state.photoURI &&
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
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bottomButtonsContainer: {
    height: 96,
    bottom: 0,
    backgroundColor: 'white',
    borderWidth: 1,
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
});
