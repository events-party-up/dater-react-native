import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
} from 'react-native';

import DaterButton from '../../components/ui-kit/atoms/dater-button';
import DaterModal from '../../components/ui-kit/organisms/dater-modal';

type Props = {
  navigation: any,
};

export default class UIKitIndexScreen extends Component<Props> {
  render() {
    return (
      <DaterModal
        fullscreen
        closeButton
        closeButtonPress={() => this.props.navigation.goBack(null)}
        headerTitle="UI Kit Collection"
        style={styles.modal}
      >
        <ScrollView>
          <DaterButton
            type="main"
            onPress={() => this.props.navigation.navigate('Buttons')}
            style={styles.button}
          >
            Buttons
          </DaterButton>
          <DaterButton
            type="main"
            onPress={() => this.props.navigation.navigate('Typography')}
            style={styles.button}
          >
            Typography
          </DaterButton>
          <DaterButton
            type="main"
            onPress={() => this.props.navigation.navigate('TextInputs')}
            style={styles.button}
          >
            Text Inputs
          </DaterButton>
        </ScrollView>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
  },
  modal: {
    paddingRight: 0,
  },
});
