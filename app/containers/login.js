import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
  Text,
} from 'react-native';


type Props = {
  navigation: any,
};

export default class LoginScreen extends Component<Props> {
  signIn = () => {
    console.log('Signing in');
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 30 }}>This is a modal!</Text>
        <Button
          onPress={() => this.props.navigation.goBack()}
          title="Dismiss"
        />
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
    zIndex: 2,
    bottom: 50,
    left: 0,
    right: 0,
  },
});
