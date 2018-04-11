import React, { Component } from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';

import { H1, H2, H3, Body, Caption1, Caption2 } from '../../components/ui-kit/typography';
import DaterModal from '../../components/ui-kit/dater-modal';

type Props = {
  navigation: any,
};

export default class TypographyScreen extends Component<Props> {
  render() {
    return (
      <DaterModal
        fullscreen
        backButton
        backButtonPress={() => this.props.navigation.goBack()}
        headerTitle="Typography"
      >
        <View style={styles.row}>
          <View style={styles.firstColumn}>
            <Caption1>H1</Caption1>
          </View>
          <View style={styles.secondColumn}>
            <H1>Sibainu 32/40</H1>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.firstColumn}>
            <Caption1>H2</Caption1>
          </View>
          <View style={styles.secondColumn}>
            <H2>Sibainu 22/24</H2>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.firstColumn}>
            <Caption1>H3</Caption1>
          </View>
          <View style={styles.secondColumn}>
            <H3>Sibainu 16/20</H3>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.firstColumn}>
            <Caption1>Body</Caption1>
          </View>
          <View style={styles.secondColumn}>
            <Body>Sibainu 16/20</Body>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.firstColumn}>
            <Caption1>Caption 1</Caption1>
          </View>
          <View style={styles.secondColumn}>
            <Caption1>Sibainu 12/16</Caption1>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.firstColumn}>
            <Caption1>Caption 2</Caption1>
          </View>
          <View style={styles.secondColumn}>
            <Caption2>Sibainu 12/16</Caption2>
          </View>
        </View>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
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
});
