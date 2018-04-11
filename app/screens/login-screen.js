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

export default class LoginScreen extends Component<Props> {
  signIn = () => {
    console.log('Signing in');
  }

  render() {
    return (
      <DaterModal
        closeButton
        closeButtonPress={() => this.props.navigation.goBack(null)}
        headerTitle="Log In"
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
  header: {
    position: 'absolute',
    left: 20,
    top: 34,
  },
  dismissButon: {
    position: 'absolute',
    right: 20,
    top: 34,
  },
  row: {
    left: 64,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 16,
  },
  firstColumn: {
    width: 50,
    justifyContent: 'center',
    alignItems: 'flex-end',
    paddingRight: 24,
    alignContent: 'center',
    alignSelf: 'center',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowRadius: 16,
    // borderRadius: 20,
    // borderWidth: 1,
    shadowOffset: {
      width: 0, height: 4,
    },
  },
});
