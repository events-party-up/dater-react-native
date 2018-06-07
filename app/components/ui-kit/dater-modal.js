import * as React from 'react';

import {
  StyleSheet,
  View,
  Platform,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';

import CircleButton from '../../components/ui-kit/circle-button';
import DaterHeader from '../../components/ui-kit/dater-header';

type Props = {
  children: React.Node,
  closeButton: boolean,
  backButton: boolean,
  closeButtonPress: () => void,
  backButtonPress: () => void,
  confirmButtonPress: () => void,
  headerTitle: string,
  style: typeof StyleSheet,
  backButtonHeightOffset: number,
};

export default class DaterModal extends React.Component<Props> {
  render() {
    return (

      <View style={this.props.fullscreen ?
        [styles.fullScreenModalContainer, this.props.style] :
        [styles.floatingModalContainer, this.props.style]}
      >
        {this.props.headerTitle && (
          <DaterHeader>
            {this.props.headerTitle}
          </DaterHeader>)}
        {this.props.backButton && Platform.OS !== 'android' && (
          <View style={[styles.backButton, { bottom: this.props.backButtonHeightOffset || 16 }]}>
            <CircleButton type="back" onPress={() => this.props.backButtonPress()} />
          </View>)}
        {this.props.closeButton && (
          <View style={styles.closeButton}>
            <CircleButton type="close" onPress={() => this.props.closeButtonPress()} />
          </View>)}
        {this.props.confirmButton && (
          <View style={styles.confirmButton}>
            <CircleButton type="confirm" onPress={() => this.props.confirmButtonPress()} />
          </View>)}
        {this.props.children}
      </View>
    );
  }
}

const modalTopSpace = () => {
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
  backButton: {
    position: 'absolute',
    left: 20,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  closeButton: {
    position: 'absolute',
    right: 0,
    left: 0,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  confirmButton: {
    position: 'absolute',
    right: 20,
    bottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  floatingModalContainer: {
    padding: 16,
    margin: 8,
    marginTop: modalTopSpace(),
    marginBottom: modalBottomMargin(),
    flex: 1,
    justifyContent: 'flex-start',
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
    paddingLeft: 16,
    paddingRight: 16,
    paddingTop: modalTopSpace(),
    flex: 1,
    justifyContent: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 4,
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowRadius: 16,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 4,
    },
    elevation: 1,
  },
});
