import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
} from 'react-native';

import { H1, H2 } from '../components/ui-kit/typography';

type Props = {
  navigation: any,
};

export default class LoginScreen extends Component<Props> {
  signIn = () => {
    console.log('Signing in');
  }

  render() {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <View style={styles.dismissButon}>
          <Button
            onPress={() => this.props.navigation.goBack()}
            title="Dismiss"
          />
        </View>
        <H1>Sibainu 32/40</H1>
        <H2>Sibainu 22/24</H2>
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
  dismissButon: {
    position: 'absolute',
    right: 8,
    top: 24,
  },
});
