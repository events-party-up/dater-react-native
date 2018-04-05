import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
} from 'react-native';

import { H2 } from '../components/ui-kit/typography';

type Props = {
  navigation: any,
};

export default class LoginScreen extends Component<Props> {
  signIn = () => {
    console.log('Signing in');
  }

  render() {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.dismissButon}>
          <Button
            onPress={() => this.props.navigation.goBack()}
            title="Dismiss"
          />
        </View>
        <View style={styles.header}>
          <H2>Log In</H2>
        </View>
        <View style={styles.button}>
          <Button title="Войти" color="blue" onPress={this.signIn} />
        </View>
      </View>

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
