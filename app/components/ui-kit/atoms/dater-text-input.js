import React, { Component } from 'react';
import { TextInput, StyleSheet } from 'react-native';


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
        height: 40,
        width: 217,
        borderColor: this.state.isFocused ? '#000000' : 'rgba(0, 0, 0, 0.2)',
        borderBottomWidth: 2,
      },
    });

    return (
      <TextInput
        ref={(component) => { this.textInput = component; }}
        style={styles.textInput}
        onChangeText={(text) => this.setState({ ...this.state, text })}
        value={this.state.text}
        placeholder={this.props.placeholder}
        placeholderTextColor="rgba(0, 0, 0, 0.2)"
        onFocus={() => this.setState({ ...this.state, isFocused: true })}
        onBlur={() => this.setState({ ...this.state, isFocused: false })}
      />
    );
  }
}
