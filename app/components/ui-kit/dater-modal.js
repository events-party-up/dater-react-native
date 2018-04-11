import * as React from 'react';

import {
  StyleSheet,
  View,
  Platform,
  ScrollView,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import CircleButton from '../../components/ui-kit/circle-button';

type Props = {
  children: React.Node,
  closeButton: boolean,
  closeButtonPress: () => void,
  backButtonPress: () => void,
};

export default class DaterModal extends React.Component<Props> {
  render() {
    return (
      <View style={this.props.fullscreen ? styles.fullScreenModalContainer : styles.floatingModalContainer}>
        {this.props.closeButton && (
        <View style={styles.closeButton}>
          <CircleButton type="close" onPress={() => this.props.closeButtonPress()} />
        </View>)}
        {this.props.backButton && (
          <View style={styles.backButton}>
            <CircleButton type="back" onPress={() => this.props.backButtonPress()} />
          </View>)}
        <ScrollView>
          {this.props.children}
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
  closeButton: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  backButton: {
    position: 'absolute',
    left: 20,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  floatingModalContainer: {
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
  fullScreenModalContainer: {
    padding: 16,
    paddingTop: 32,
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
