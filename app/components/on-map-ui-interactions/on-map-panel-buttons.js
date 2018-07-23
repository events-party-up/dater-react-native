import * as React from 'react';
import { Animated, Alert } from 'react-native';

import CircleButton from '../../components/ui-kit/atoms/circle-button';
import DaterButton from '../../components/ui-kit/atoms/dater-button';

const takePhotoIcon = require('../../assets/icons/take-photo/take-photo-white.png');
const daterLogo = require('../../assets/icons/dater-logo/dater-logo.png');

type Props = {
  panelButtonsAnimatedValue: typeof Animated.Value,
  mapPanel: any,
  dispatch: any,
  navigation: any,
}

export default class OnMapPanelButtons extends React.Component<Props> {
  showMeTargetUser = () => {
    this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_WITH_BUTTON' });
    this.props.dispatch({ type: 'MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE' });
  }

  requestMicroDate = (targetUser) => {
    this.props.dispatch({
      type: 'MICRO_DATE_OUTGOING_REQUEST_INIT',
      payload: {
        targetUser,
      },
    });
  }

  onPressAreYouReady = () => {
    this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_WITH_BUTTON' });
    this.props.dispatch({ type: 'MICRO_DATE_IM_READY' });
  }

  cancelPendingSearch = () => {
    Alert.alert(
      'Ты уверен?',
      'Мы уже почти нашли тебе пару для встречи!',
      [
        { text: 'Нет', onPress: () => {} },
        {
          text: 'Уверен',
          onPress: () => {
            this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_WITH_BUTTON' });
            this.props.dispatch({ type: 'MICRO_DATE_PENDING_SEARCH_CANCEL' });
          },
        },
      ],
      { cancelable: true },
    );
  }

  cancelOutgoingMicroDate = () => {
    this.props.dispatch({ type: 'MICRO_DATE_OUTGOING_CANCEL' });
  }

  acceptIncomingMicroDate = () => {
    this.props.dispatch({ type: 'MICRO_DATE_INCOMING_ACCEPT_INIT' });
  }

  declineIncomingMicroDate = () => {
    this.props.dispatch({
      type: 'MICRO_DATE_INCOMING_DECLINE_BY_ME',
    });
  }

  stopMicroDate = () => {
    Alert.alert(
      'Отменить встречу?',
      'Встреча будет отменена, а весь прогресс будет потерян.',
      [
        { text: 'Нет', onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
        { text: 'Отменить', onPress: () => this.props.dispatch({ type: 'MICRO_DATE_STOP' }) },
      ],
      { cancelable: false },
    );
  }

  openCamera = () => {
    this.props.navigation.navigate({
      key: 'MicroDateSelfie',
      routeName: 'MakePhotoSelfieScreen',
      params: {
        photoType: 'microDateSelfie',
        navigationFlowType: 'mapViewModal',
      },
    });
  }

  openDaterLogo = () => {
    this.props.navigation.navigate({
      key: 'DaterLogoScreen',
      routeName: 'DaterLogoScreen',
    });
  }

  declineSelfie = () => {
    this.props.dispatch({ type: 'MICRO_DATE_DECLINE_SELFIE_BY_ME' });
  }

  approveSelfie = () => {
    this.props.dispatch({ type: 'MICRO_DATE_APPROVE_SELFIE' });
  }
  closeMicroDateStopped = () => {
    this.closePanel();
    this.props.dispatch({ type: 'MICRO_DATE_ASK_ARE_YOU_READY' });
  }

  closePanel = () => {
    this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_WITH_BUTTON' });
  }

  renderButtons() {
    switch (this.props.mapPanel.mode) {
      case 'userCard':
        return (
          <DaterButton
            onPress={() => this.requestMicroDate(this.props.mapPanel.targetUser)}
          >
            Встретиться
          </DaterButton>
        );
      case 'areYouReady':
        return (
          <DaterButton
            onPress={this.onPressAreYouReady}
          >
            Я {this.props.mapPanel.gender === 'female' ? 'готова' : 'готов'}
          </DaterButton>
        );
      case 'pendingSearch':
        return (
          <DaterButton
            onPress={this.cancelPendingSearch}
          >
            Отменить
          </DaterButton>
        );
      case 'activeMicroDate':
        return (
          <DaterButton
            onPress={this.stopMicroDate}
          >
            Отменить
          </DaterButton>
        );
      case 'microDateStopped':
        return (
          <CircleButton type="close" onPress={this.closeMicroDateStopped} size="medium-big" />
        );
      case 'microDateRequestExpired':
        return (
          <CircleButton type="close" onPress={this.closePanel} size="medium-big" />
        );
      case 'microDatetExpired':
        return (
          <CircleButton type="close" onPress={this.closePanel} size="medium-big" />
        );
      case 'makeSelfie':
        return (
          <React.Fragment>
            <CircleButton
              size="medium-big"
              onPress={this.openDaterLogo}
              image={daterLogo}
              roundImage
              style={{
                alignContent: 'center',
                shadowColor: '#4F4F4F',
                backgroundColor: '#f06eaa',
              }}
            />
            <CircleButton
              size="medium-big"
              onPress={this.openCamera}
              image={takePhotoIcon}
              style={{
                alignContent: 'center',
                shadowColor: '#4F4F4F',
                backgroundColor: '#4F4F4F',
              }}
            />
          </React.Fragment>
        );
      // case 'selfieUploading':
      // case 'selfieUploadedByMe':
      case 'selfieUploadedByTarget':
        return (
          <React.Fragment>
            <CircleButton type="decline" size="medium-big" onPress={this.declineSelfie} />
            <CircleButton type="confirm" size="medium-big" onPress={this.approveSelfie} />
          </React.Fragment>
        );
      default:
        return null;
    }
  }

  render() {
    return (
      <Animated.View
        pointerEvents="box-none"
        style={{
          bottom: this.props.panelButtonsAnimatedValue,
          right: 0,
          left: 0,
          alignItems: 'center',
          alignContent: 'center',
          position: 'absolute',
          flexDirection: 'row',
          justifyContent: 'space-evenly',
          zIndex: 1,
        }}
      >
        {this.renderButtons()}
      </Animated.View>
    );
  }
}
