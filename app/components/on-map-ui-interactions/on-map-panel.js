import * as React from 'react';
import { View, TouchableOpacity } from 'react-native';
import 'moment/locale/ru';
import { Dispatch } from 'react-redux';

import MapPanelStyles from './map-panel-templates/map-panel-styles';

import MapPanelSelfieUploading from './map-panel-templates/map-panel-selfie-uploading';
import MapPanelSelfieUploadedByMe from './map-panel-templates/map-panel-selfie-uploaded-by-me';
import MapPanelSelfieUploadedByTarget from './map-panel-templates/map-panel-selfie-uploaded-by-target';
import MapPanelUserCard from './map-panel-templates/map-panel-user-card';
import MapPanelMakeSelfie from './map-panel-templates/map-panel-make-selfie';
import MapPanelActiveMicroDate from './map-panel-templates//map-panel-active-micro-date';
import MapPanelIncomingRequest from './map-panel-templates/map-panel-incoming-request';
import MapPanelAwaitingAcceptRequest from './map-panel-templates/map-panel-awaiting-accept-request'; // eslint-disable-line
import MapPanelRequestDeclined from './map-panel-templates/map-panel-request-declined';
import MapPanelRequestCancelled from './map-panel-templates/map-panel-request-cancelled';
import MapPanelMicroDateStopped from './map-panel-templates/map-panel-micro-date-stopped';

type Props = {
  mapPanel: any,
  microDate: any,
  dispatch: Dispatch,
  navigation: any,
  uploadPhotos: any,
  dispatch: Dispatch,
  navigation: any,
  onPressHandle: () => void,
};

type State = {
}

export default class OnMapPanel extends React.Component<Props, State> {
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
            acceptTS={this.props.mapPanel.microDate.acceptTS}
          />
        );
      case 'incomingMicroDateRequest':
        return (
          <MapPanelIncomingRequest
            targetUser={this.props.mapPanel.targetUser}
            distance={this.props.mapPanel.distance}
            microDateId={this.props.mapPanel.microDateId}
            onPressDecline={this.declineIncomingMicroDate}
            onPressAccept={this.acceptIncomingMicroDate}
            requestTS={this.props.mapPanel.microDate.requestTS}
          />
        );
      case 'outgoingMicroDateAwaitingAccept':
        return (
          <MapPanelAwaitingAcceptRequest
            targetUser={this.props.mapPanel.targetUser}
            onPressCancel={this.cancelOutgoingMicroDate}
            requestTS={this.props.mapPanel.microDate.requestTS}
          />
        );
      case 'outgoingMicroDateDeclined':
        return (
          <MapPanelRequestDeclined
            targetUser={this.props.mapPanel.targetUser}
            onPressClose={this.closePanel}
            declineTS={this.props.mapPanel.microDate.declineTS}
          />
        );
      case 'incomingMicroDateCancelled':
        return (
          <MapPanelRequestCancelled
            targetUser={this.props.mapPanel.targetUser}
            onPressClose={this.closePanel}
          />
        );
      case 'microDateStopped':
        return (
          <MapPanelMicroDateStopped
            targetUser={this.props.mapPanel.targetUser}
            onPressClose={this.closePanel}
            stopTS={this.props.mapPanel.microDate.stopTS}
          />
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
        <TouchableOpacity
          style={MapPanelStyles.panelHandle}
          onPress={this.props.onPressHandle}
          hitSlop={{
            top: 10,
            bottom: 10,
            left: 50,
            right: 50,
          }}
        />
        {this.renderCard()}
      </View>
    );
  }
}
