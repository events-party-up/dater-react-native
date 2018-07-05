import * as React from 'react';
import { Animated, Alert } from 'react-native';

import CircleButton from '../../components/ui-kit/atoms/circle-button';
import DaterButton from '../../components/ui-kit/atoms/dater-button';

const takePhotoIcon = require('../../assets/icons/take-photo/take-photo-white.png');

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

  declineSelfie = () => {
    this.props.dispatch({ type: 'MICRO_DATE_DECLINE_SELFIE_BY_ME' });
  }

  approveSelfie = () => {
    this.props.dispatch({ type: 'MICRO_DATE_APPROVE_SELFIE' });
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
      case 'activeMicroDate':
        return (
          <DaterButton
            onPress={this.stopMicroDate}
          >
            Отменить
          </DaterButton>
        );
      case 'incomingMicroDateRequest':
        return (
          <React.Fragment>
            <CircleButton type="decline" size="medium-big" onPress={this.declineIncomingMicroDate} />
            <CircleButton type="confirm" size="medium-big" onPress={this.acceptIncomingMicroDate} />
          </React.Fragment>
        );
      case 'outgoingMicroDateAwaitingAccept':
        return (
          <DaterButton
            onPress={this.cancelOutgoingMicroDate}
          >
            Отменить
          </DaterButton>
        );
      case 'outgoingMicroDateDeclined':
        return (
          <CircleButton type="close" onPress={this.closePanel} size="medium-big" />
        );
      case 'incomingMicroDateCancelled':
        return (
          <CircleButton type="close" onPress={this.closePanel} size="medium-big" />
        );
      case 'microDateStopped':
        return (
          <CircleButton type="close" onPress={this.closePanel} size="medium-big" />
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
          <CircleButton
            size="medium-big"
            onPress={this.openCamera}
            // size="medium-big"
            image={takePhotoIcon}
            style={{
              alignContent: 'center',
              shadowColor: '#4F4F4F',
              backgroundColor: '#4F4F4F',
            }}
          />
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
