import * as React from 'react';
import {
  StyleSheet,
  ActivityIndicator,
  Image,
  ScrollView,
  View,
} from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';

import DaterModal from '../components/ui-kit/organisms/dater-modal';
import cloudinaryUrl from '../utils/cloudinary-utils';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';

type Props = {
  navigation: any,
};

type State = {
  showBackButton: boolean,
  isImageLoaded: boolean,
}

export default class FullscreenPhotoScreen extends React.Component<Props, State> {
  photo: string;
  imageUrls: any;

  constructor(props) {
    super(props);
    this.state = {
      showBackButton: true,
      isImageLoaded: false,
    };
  }

  async componentWillMount() {
    this.photo = cloudinaryUrl(this.props.navigation.getParam('photo'), { width: SCREEN_WIDTH, crop: 'scale' });
    const isImagedPrefetched = await Image.prefetch(this.photo);
    this.setState({
      isImageLoaded: isImagedPrefetched,
    });
  }

  onClick = () => {
    this.setState((prevstate) => ({
      showBackButton: !prevstate.showBackButton,
    }));
  }

  onMove = () => {
    this.setState({
      showBackButton: false,
    });
  }

  render() {
    return (
      <DaterModal
        fullscreen
        backButton={this.state.showBackButton}
        backButtonPress={() => this.props.navigation.goBack()}
        style={styles.photoContainer}
      >
        <ScrollView
          alwaysBounceHorizontal
        >
          {!this.state.isImageLoaded &&
            <View
              style={styles.fullScreen}
            >
              <ActivityIndicator
                color="white"
                size="large"
                style={styles.loadingIndicator}
              />
            </View>
          }
          {this.state.isImageLoaded &&
            <ImageZoom
              cropWidth={SCREEN_WIDTH}
              cropHeight={SCREEN_HEIGHT}
              imageWidth={SCREEN_WIDTH}
              imageHeight={SCREEN_HEIGHT}
              enableHorizontalBounce
              onClick={this.onClick}
              panToMove
              pinchToZoom
              minScale="1"
              onMove={this.onMove}
            >
              <Image
                resizeMode="contain"
                style={styles.fullScreen}
                source={{ uri: this.photo }}
              />
            </ImageZoom>
          }
        </ScrollView>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  photoContainer: {
    paddingLeft: 0,
    paddingRight: 0,
    backgroundColor: 'black',
    paddingTop: 0,
    borderRadius: 0,
  },
  loadingIndicator: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    top: 0,
    right: 0,
    backgroundColor: 'black',
  },
  fullScreen: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
});
