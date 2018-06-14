import React, { Component } from 'react';
import {
  StyleSheet,
  ScrollView,
} from 'react-native';

import DaterButton from '../../components/ui-kit/atoms/dater-button';
import CircleButton from '../../components/ui-kit/atoms/circle-button';
import DaterModal from '../../components/ui-kit/organisms/dater-modal';

type Props = {
  navigation: any,
};

export default class DaterButtonsScreen extends Component<Props> {
  render() {
    return (
      <DaterModal
        fullscreen
        backButton
        backButtonPress={() => this.props.navigation.goBack()}
        headerTitle="Buttons"
        style={styles.modal}
      >
        <ScrollView>
          <DaterButton type="main">
            button cta
          </DaterButton>
          <DaterButton type="secondary">
            button sec
          </DaterButton>
          <DaterButton type="text">
            text button
          </DaterButton>
          <DaterButton type="main" xpReward={14}>
            награда xp
          </DaterButton>
          <DaterButton type="secondary" xpReward={14}>
            reward xp
          </DaterButton>
          <DaterButton type="main" coinReward={2}>
            Coin Reward
          </DaterButton>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
          <CircleButton type="close" />
          <CircleButton type="back" />
        </ScrollView>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    paddingRight: 0,
  },
});
