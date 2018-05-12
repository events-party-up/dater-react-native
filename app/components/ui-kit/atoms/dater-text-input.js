import React, { Component } from 'react';
import { TextInput, StyleSheet } from 'react-native';

/**
 * All props can be found at:
 * https://facebook.github.io/react-native/docs/textinput.html
 *
 * keyboardType:
 *
 * default
 * numeric
 * email-address
 * phone-pad
 *
 * returnKeyType:
 *
 * done
 * go
 * next
 * search
 * send
 */

type Props = {
  placeholder: string,
  // label: string,
};

type State = {
  isFocused: bool,
  text: string,
}

export default class DaterTextInput extends Component<Props, State> {
  textInput: TextInput;

  constructor(props: any) {
    super(props);
    this.state = {
      isFocused: false,
      text: '',
    };
  }

  render() {
    const styles = StyleSheet.create({
      textInput: {
        height: 48,
        width: 217,
        borderColor: this.state.isFocused ? '#000000' : 'rgba(0, 0, 0, 0.2)',
        borderBottomWidth: 2,
        fontFamily: (this.state.isFocused && this.state.text.length > 0) ||
          this.state.text.length > 0 ? 'OpenSans-SemiBold' : 'OpenSans-Regular',
        color: '#000000',
        lineHeight: 22,
        fontSize: 16,
        textAlign: 'left',
        marginBottom: 8,
      },
    });

    return (
      <TextInput
        ref={(component) => { this.textInput = component; }}
        style={styles.textInput}
        onChangeText={(text) => this.setState({ ...this.state, text })}
        value={this.state.text}
        placeholderTextColor="rgba(0, 0, 0, 0.2)"
        onFocus={() => this.setState({ ...this.state, isFocused: true })}
        onBlur={() => this.setState({ ...this.state, isFocused: false })}
        allowFontScaling={false}
        autoCorrect={false}
        underlineColorAndroid="transparent"
        {...this.props}
      />
    );
  }
}
