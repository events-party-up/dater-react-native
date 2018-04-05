import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Button,
} from 'react-native';

import { H1, H2, H3, Body, Caption1, Caption2 } from '../../components/ui-kit/typography';

type Props = {
  navigation: any,
};

export default class TypographyContainer extends Component<Props> {
  render() {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.dismissButon}>
          <Button
            onPress={() => this.props.navigation.goBack()}
            title="Dismiss"
          />
        </View>
        <View style={styles.header}>
          <H2>Typography</H2>
        </View>
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
    flex: 1,
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.05)',
    shadowRadius: 16,
    // borderRadius: 20,
    // borderWidth: 1,
    shadowOffset: {
      width: 0, height: 4,
    },
  },
});
