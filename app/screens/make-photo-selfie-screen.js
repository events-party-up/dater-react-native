import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Text,
} from 'react-native';
import { RNCamera } from 'react-native-camera';

import DaterButton from '../components/ui-kit/dater-button';
import DaterModal from '../components/ui-kit/dater-modal';

type Props = {
  navigation: any,
};

type State = {
  faces: [],
}

export default class MakePhotoSelfieScreen extends Component<Props, State> {
  camera: RNCamera;
  constructor(props: any) {
    super(props);
    this.state = {
      faces: [],
    };
  }

  takePicture = async () => {
    if (this.camera) {
      const options = { quality: 0.5, base64: true };
      const data = await this.camera.takePictureAsync(options);
      console.log(data.uri);
    }
  };

  onFacesDetected = ({ faces }) => this.setState({ faces });

  onFaceDetectionError = (error) => console.log(error);

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
        backButton
        backButtonPress={() => this.props.navigation.goBack()}
        style={styles.container}
      >
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
        <DaterButton
          onPress={() => this.takePicture()}
          style={styles.capture}
          type="secondary"
        >
          SNAP
        </DaterButton>
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
    backgroundColor: 'yellow',
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 0,
  },
  preview: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  capture: {
    alignSelf: 'center',
    bottom: 32,
  },
});
