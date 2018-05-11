import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
} from 'react-native';

import DaterModal from '../components/ui-kit/dater-modal';

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
        <View style={styles.button}>
          <Button title="Войти" color="blue" onPress={this.signIn} />
        </View>
      </DaterModal>

    );
  }
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
  },
});
