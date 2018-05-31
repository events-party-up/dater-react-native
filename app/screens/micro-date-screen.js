import React, { Component } from 'react';
import { ScrollView } from 'react-native';

import DaterModal from '../components/ui-kit/dater-modal';
import DaterButton from '../components/ui-kit/dater-button';

type Props = {
  navigation: any,
};

export default class TextInputsScreen extends Component<Props> {
  componentDidMount() {
    console.log(this.props.navigation.getParam('microDate'));
  }

  render() {
    return (
      <DaterModal
        fullscreen
        closeButton
        closeButtonPress={() => this.props.navigation.goBack()}
        headerTitle="Карточка встречи"
      >
        <ScrollView>
          <DaterButton
            onPress={() => this.props.navigation.navigate('LoginPhone')}
          >
            Далее
          </DaterButton>
        </ScrollView>
      </DaterModal>
    );
  }
}
