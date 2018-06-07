import React, { Component } from 'react';
import { StyleSheet } from 'react-native';

import DaterModal from '../components/ui-kit/dater-modal';
import DaterButton from '../components/ui-kit/atoms/dater-button';

type Props = {
  navigation: any,
};

export default class FloatingScreen extends Component<Props> {
  signIn = () => {
    console.log('Signing in');
  }

  render() {
    return (
      <DaterModal
        closeButton
        closeButtonPress={() => this.props.navigation.goBack(null)}
        headerTitle="Floating Screen"
      >
        <DaterButton
          style={styles.button}
          onPress={() => this.props.navigation.navigate('LoginPhone')}
        >
          Далее
        </DaterButton>
      </DaterModal>

    );
  }
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'center',
  },
});
