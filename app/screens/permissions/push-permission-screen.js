import React, { Component } from 'react';
import { connect, Dispatch } from 'react-redux';
import {
  StyleSheet,
  Image,
  Platform,
  View,
} from 'react-native';
import Permissions from 'react-native-permissions';
import RNANAndroidSettingsLibrary from 'react-native-android-settings-library';
import { delay } from 'lodash';

import DaterButton from '../../components/ui-kit/atoms/dater-button';
import DaterModal from '../../components/ui-kit/organisms/dater-modal';
import { H2, Body } from '../../components/ui-kit/atoms/typography';
import { PermissionsState } from '../../types';

const pushIcon = require('../../assets/icons/push/push.png');
const errorIcon = require('../../assets/icons/error/error.png');

const mapStateToProps = (state) => ({
  permissions: state.permissions,
});

type Props = {
  navigation: any,
  permissions: PermissionsState,
  dispatch: Dispatch,
};

type State = {
  isRequesting: boolean,
  showDenied: boolean,
};

class PushPermissionScreen extends Component<Props, State> {
  navigationFlowType: string;

  constructor(props) {
    super(props);

    this.state = {
      isRequesting: false,
      showDenied: false,
    };
  }

  componentWillMount() {
    this.navigationFlowType = this.props.navigation.getParam('navigationFlowType');

    if (this.props.permissions.fcmDenied) {
      this.setState({
        showDenied: true,
        isRequesting: false,
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.permissions.fcmGranted && this.navigationFlowType !== 'registration') {
      this.props.navigation.popToTop();
      this.props.navigation.goBack(null);
    } else if (nextProps.permissions.fcmDenied && !nextProps.permissions.fcmRequesting) {
      this.setState({
        showDenied: true,
        isRequesting: false,
      });
    }
  }

  onAllowPress = () => {
    this.props.dispatch({ type: 'PERMISSIONS_FCM_REQUEST' });
    this.setState({
      isRequesting: true,
    });
  }

  onSettingsPress = () => {
    if (Platform.OS === 'ios') {
      Permissions.openSettings();
    } else {
      RNANAndroidSettingsLibrary.open('ACTION_APPLICATION_DETAILS_SETTINGS');
    }
    delay(() => // artificial delay so user doesn't see the content switch
      this.setState({
        showDenied: false,
      }), 1000);
  }

  render() {
    return (
      <DaterModal
        fullscreen
        backButton={this.navigationFlowType === 'register'}
        backButtonPress={() => this.props.navigation.goBack()}
        style={styles.modal}
      >
        <View
          style={styles.topImage}
        >
          <Image
            source={pushIcon}
          />
          {this.state.showDenied &&
            <Image
              source={errorIcon}
              style={{
                position: 'absolute',
                right: -2,
                bottom: 6,
              }}
            />
          }
        </View>
        {!this.state.showDenied &&
          <H2 style={styles.header}>Разреши отправку{'\n'}уведомлений</H2>
        }
        {this.state.showDenied &&
          <H2 style={styles.header}>Уведомления{'\n'}отключены :(</H2>
        }
        {!this.state.showDenied &&
          <Body style={styles.subHeader}>
            Dater шлет только самые важные сообщения.{' '}
            Предложения о встречах, ответ в переписке, зачисление монет и др.
          </Body>
        }
        {this.state.showDenied &&
          <Body style={styles.subHeader}>
            Dater не будет работать{'\n'} без уведомлений.{'\n'}
          Чтобы продолжить, перейди{'\n'}в настройки и дай разрешение{'\n'}на уведомления.
          </Body>
        }
        {!this.state.showDenied &&
          <DaterButton
            onPress={this.onAllowPress}
            style={styles.button}
            inProgress={this.state.isRequesting}
            disabled={this.state.isRequesting}
          >
            {this.state.isRequesting ? 'Запрашиваю...' : 'Разрешить'}
          </DaterButton>
        }
        {this.state.showDenied &&
          <DaterButton
            style={styles.button}
            onPress={this.onSettingsPress}
          >
            Настройки
          </DaterButton>
        }
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  modal: {
    paddingLeft: 24,
    paddingRight: 24,
  },
  topImage: {
    marginTop: 64,
    marginBottom: 46,
    alignSelf: 'center',
  },
  header: {
    textAlign: 'center',
    marginBottom: 16,
  },
  subHeader: {
    textAlign: 'center',
    marginBottom: 64,
  },
  button: {
    alignSelf: 'center',
  },
});

export default connect(mapStateToProps)(PushPermissionScreen);
