import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import DaterButton from '../../components/ui-kit/dater-button';
import CircleButton from '../../components/ui-kit/circle-button';
import DaterModal from '../../components/ui-kit/dater-modal';

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
      >
        <View style={styles.row}>
          <DaterButton type="main">
            button cta
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="secondary">
            button sec
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="text">
            text button
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="main" xpReward={14}>
            награда xp
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="secondary" xpReward={14}>
            reward xp
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="main" coinReward={2}>
            Coin Reward
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
        </View>
        <View style={styles.row}>
          <DaterButton type="secondary" coinReward={2}>
            Coin Reward
          </DaterButton>
        </View>
        <View style={styles.row}>
          <CircleButton type="close" />
          <CircleButton type="back" />
        </View>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingBottom: 16,
  },
});
