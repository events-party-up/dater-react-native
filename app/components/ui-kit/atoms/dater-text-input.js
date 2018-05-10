import React, { Component } from 'react';
import { TextInput } from 'react-native';

type Props = {
  placeHolder: string,
  // label: string,
};

export default class DaterTextInput extends Component<Props> {
  render() {
    return (
      <TextInput
        style={{ height: 40, borderColor: 'gray', borderWidth: 1 }}
        onChangeText={(text) => this.setState({ text })}
        value={this.state.text}
        placeholder={this.props.placeHolder}
      />
    );
  }
}
