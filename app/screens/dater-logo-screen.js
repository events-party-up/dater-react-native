import * as React from 'react';
import {
  StyleSheet,
  Image,
} from 'react-native';

import DaterModal from '../components/ui-kit/organisms/dater-modal';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '../constants';

const daterLogoImage = require('../assets/images/dater-logo/dater-logo.png');

type Props = {
  navigation: any,
};

export default class DaterLogoScreen extends React.Component<Props> {
  render() {
    return (
      <DaterModal
        fullscreen
        closeButton
        closeButtonPress={() => this.props.navigation.goBack()}
        style={styles.photoContainer}
      >
        <Image
          style={styles.fullScreen}
          source={daterLogoImage}
        />
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
