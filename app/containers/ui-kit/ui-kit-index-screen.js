import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Platform,
  ScrollView,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import DaterButton from '../../components/ui-kit/dater-button';
import CircleButton from '../../components/ui-kit/circle-button';

type Props = {
  navigation: any,
};

export default class UIKitIndexScreen extends Component<Props> {
  render() {
    return (
      <View style={styles.modalContainer}>
        <View style={styles.dismissButon}>
          <CircleButton type="close" onPress={() => this.props.navigation.goBack(null)} />
        </View>
        <ScrollView>
          <View style={styles.row}>
            <DaterButton type="main" onPress={() => this.props.navigation.navigate('Buttons')}>
              Buttons
            </DaterButton>
          </View>
          <View style={styles.row}>
            <DaterButton type="main" onPress={() => this.props.navigation.navigate('Typography')}>
              Typography
            </DaterButton>
          </View>
        </ScrollView>
      </View>

    );
  }
}

const modalTopMargin = () => {
  if (Platform.OS === 'android') {
    return 8;
  } else if (DeviceInfo.getModel() === 'iPhone X') {
    return 40;
  } else if (Platform.OS === 'ios') {
    return 20;
  }
  return 8;
};

const modalBottomMargin = () => {
  if (DeviceInfo.getModel() === 'iPhone X') {
    return 20;
  }
  return 8;
};

const styles = StyleSheet.create({
  dismissButon: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  row: {
    flexDirection: 'row',
    paddingBottom: 16,
    justifyContent: 'center',
  },
  modalContainer: {
    padding: 16,
    margin: 8,
    marginTop: modalTopMargin(),
    marginBottom: modalBottomMargin(),
    flex: 1,
    justifyContent: 'center',
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    shadowRadius: 16,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 4,
    },
    elevation: 1,
  },
});
