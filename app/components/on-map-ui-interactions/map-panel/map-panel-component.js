import * as React from 'react';
import { View } from 'react-native';
import 'moment/locale/ru';
import Moment from 'react-moment';
import { Dispatch } from 'react-redux';

import MapPanelStyles from './map-panel-styles';

import { H2, Caption2 } from '../../../components/ui-kit/atoms/typography';
import DaterButton from '../../../components/ui-kit/atoms/dater-button';
import MapPanelSelfieUploading from './map-panel-selfie-uploading';
import MapPanelSelfieUploadedByMe from './map-panel-selfie-uploaded-by-me';
import MapPanelSelfieUploadedByTarget from './map-panel-selfie-uploaded-by-target';
import MapPanelUserCard from './map-panel-user-card';
import MapPanelMakeSelfie from './map-panel-make-selfie';
import MapPanelActiveMicroDate from './map-panel-active-micro-date';
import MapPanelIncomingMicroDateRequest from './map-panel-incoming-micro-date-request';

type Props = {
  mapPanel: any,
  microDate: any,
  dispatch: Dispatch,
  navigation: any,
  uploadPhotos: any,
  dispatch: Dispatch,
  navigation: any,
};

type State = {
}

export default class MapPanelComponent extends React.Component<Props, State> {
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
    this.props.dispatch({ type: 'MICRO_DATE_STOP' });
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

  onSelfieDeclinedByMe = () => {
    this.props.dispatch({ type: 'MICRO_DATE_DECLINE_SELFIE_BY_ME' });
  }

  onSelfieApprovedByMe = () => {
    this.props.dispatch({ type: 'MICRO_DATE_APPROVE_SELFIE' });
  }

  closePanel = () => {
    this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_WITH_BUTTON' });
  }

  renderCard() {
    switch (this.props.mapPanel.mode) {
      case 'userCard':
        return (
          <MapPanelUserCard
            mapPanel={this.props.mapPanel}
            onPress={() => this.requestMicroDate(this.props.mapPanel.targetUser)}
          />
        );
      case 'activeMicroDate':
        return (
          <MapPanelActiveMicroDate
            targetUser={this.props.mapPanel.targetUser}
            distance={this.props.mapPanel.distance}
            onPressStop={this.stopMicroDate}
            onPressShowMeTarget={this.showMeTargetUser}
          />
        );
      case 'incomingMicroDateRequest':
        return (
          <MapPanelIncomingMicroDateRequest
            targetUser={this.props.mapPanel.targetUser}
            distance={this.props.mapPanel.distance}
            microDateId={this.props.mapPanel.microDateId}
            onPressDecline={this.declineIncomingMicroDate}
            onPressAccept={this.acceptIncomingMicroDate}
          />
        );
      case 'outgoingMicroDateAwaitingAccept':
        return (
          <View>
            <H2 style={MapPanelStyles.panelHeader}>Ожидание ответа</H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              Запрос на встречу с {this.props.mapPanel.targetUser.name} отправлен{' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.requestTS}</Moment>.{'\n'}
              User ID: {this.props.mapPanel.microDate.requestFor.substring(0, 4)}
            </Caption2>
            <DaterButton
              style={MapPanelStyles.panelButton}
              onPress={this.cancelOutgoingMicroDate}
            >
              Отменить
            </DaterButton>
          </View>
        );
      case 'outgoingMicroDateDeclined':
        return (
          <View>
            <H2 style={MapPanelStyles.panelHeader}>
              Запрос отклонен :(
            </H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              {this.props.mapPanel.targetUser.name} отклонил запрос на встречу{' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.declineTS}</Moment>.{'\n'}
            </Caption2>
            <DaterButton style={MapPanelStyles.panelButton} onPress={this.closePanel}>
              ОК
            </DaterButton>
          </View>
        );
      case 'incomingMicroDateCancelled':
        return (
          <View>
            <H2 style={MapPanelStyles.panelHeader}>
              Запрос от {this.props.mapPanel.targetUser.name} отменен
            </H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              {this.props.mapPanel.targetUser.name} отменил запрос на встречу {' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.cancelRequestTS}</Moment>.
            </Caption2>
            <DaterButton style={MapPanelStyles.panelButton} onPress={this.closePanel}>
              ОК
            </DaterButton>
          </View>
        );
      case 'microDateStopped':
        return (
          <View>
            <H2 style={MapPanelStyles.panelHeader}>
              {this.props.mapPanel.targetUser.name} отменил встречу :(
            </H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              Встреча с {this.props.mapPanel.targetUser.name} отменена {' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.stopTS}</Moment>.
            </Caption2>
            <DaterButton style={MapPanelStyles.panelButton} onPress={this.closePanel}>
              ОК
            </DaterButton>
          </View>
        );
      case 'makeSelfie':
        return (
          <MapPanelMakeSelfie
            mapPanel={this.props.mapPanel}
            onPressOpenCamera={this.openCamera}
            stopMicroDate={this.stopMicroDate} // TODO: remove
          />
        );
      case 'selfieUploading':
        return (
          <MapPanelSelfieUploading
            aspectRatio={this.props.mapPanel.uploadSelfie.aspectRatio}
            photoURI={this.props.mapPanel.uploadSelfie.photoURI}
            progress={this.props.uploadPhotos.progress}
          />
        );
      case 'selfieUploadedByMe':
        return (
          <MapPanelSelfieUploadedByMe
            aspectRatio={this.props.mapPanel.microDate.selfie.width / this.props.mapPanel.microDate.selfie.height}
            cloudinaryPublicId={this.props.mapPanel.microDate.id}
            cloudinaryImageVersion={this.props.mapPanel.microDate.selfie.version}
            targetUser={this.props.mapPanel.targetUser}
          />
        );
      case 'selfieUploadedByTarget':
        return (
          <MapPanelSelfieUploadedByTarget
            aspectRatio={this.props.mapPanel.microDate.selfie.width / this.props.mapPanel.microDate.selfie.height}
            cloudinaryPublicId={this.props.mapPanel.microDate.id}
            cloudinaryImageVersion={this.props.mapPanel.microDate.selfie.version}
            targetUser={this.props.mapPanel.targetUser}
            onDecline={this.onSelfieDeclinedByMe}
            onApprove={this.onSelfieApprovedByMe}
          />
        );
      default:
        return null;
    }
  }

  render() {
    return (
      <View style={MapPanelStyles.panel}>
        <View style={MapPanelStyles.panelHandle} />
        {this.renderCard()}
      </View>
    );
  }
}
