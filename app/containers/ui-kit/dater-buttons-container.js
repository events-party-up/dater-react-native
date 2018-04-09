import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
  Platform,
} from 'react-native';

import DaterButton from '../../components/ui-kit/dater-button';

type Props = {
  navigation: any,
};

export default class DaterButtonsContainer extends Component<Props> {
  render() {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.dismissButon}>
          <Button
            onPress={() => this.props.navigation.goBack()}
            title="Dismiss"
          />
        </View>
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
      </View>

    );
  }
}

const styles = StyleSheet.create({
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
    margin: 8,
    marginTop: Platform.OS === 'ios' ? 20 : 8,
    flex: 1,
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: '#ffffff',
    shadowRadius: 16,
    borderRadius: 4,
    shadowOffset: {
      width: 0, height: 4,
    },
  },
});
