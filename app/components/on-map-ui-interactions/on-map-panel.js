import * as React from 'react';
import { View, Animated, TouchableOpacity } from 'react-native';
import 'moment/locale/ru';

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
import MapPanelRequestExpired from './map-panel-templates/map-panel-request-expired';
import MapPanelMicroDateExpired from './map-panel-templates/map-panel-micro-date-expired';

type Props = {
  mapPanel: any,
  microDate: any,
  uploadPhotos: any,
  onPressHandle: () => void,
  panelButtonsAnimatedValue: Animated.Value,
};

type State = {
}

export default class OnMapPanel extends React.Component<Props, State> {
  renderCard() {
    switch (this.props.mapPanel.mode) {
      case 'userCard':
        return (
          <MapPanelUserCard
            mapPanel={this.props.mapPanel}
          />
        );
      case 'activeMicroDate':
        return (
          <MapPanelActiveMicroDate
            targetUser={this.props.mapPanel.targetUser}
            distance={this.props.mapPanel.distance}
            acceptTS={this.props.mapPanel.microDate.acceptTS}
          />
        );
      case 'incomingMicroDateRequest':
        return (
          <MapPanelIncomingRequest
            targetUser={this.props.mapPanel.targetUser}
            distance={this.props.mapPanel.distance}
            microDateId={this.props.mapPanel.microDateId}
            requestTS={this.props.mapPanel.microDate.requestTS}
          />
        );
      case 'outgoingMicroDateAwaitingAccept':
        return (
          <MapPanelAwaitingAcceptRequest
            targetUser={this.props.mapPanel.targetUser}
            requestTS={this.props.mapPanel.microDate.requestTS}
            panelButtonsAnimatedValue={this.props.panelButtonsAnimatedValue}
          />
        );
      case 'outgoingMicroDateDeclined':
        return (
          <MapPanelRequestDeclined
            targetUser={this.props.mapPanel.targetUser}
            declineTS={this.props.mapPanel.microDate.declineTS}
          />
        );
      case 'incomingMicroDateCancelled':
        return (
          <MapPanelRequestCancelled
            targetUser={this.props.mapPanel.targetUser}
          />
        );
      case 'microDateStopped':
        return (
          <MapPanelMicroDateStopped
            targetUser={this.props.mapPanel.targetUser}
            stopTS={this.props.mapPanel.microDate.stopTS}
          />
        );
      case 'microDateRequestExpired':
        return (
          <MapPanelRequestExpired
            targetUser={this.props.mapPanel.targetUser}
            mapPanel={this.props.mapPanel}
          />
        );
      case 'microDatetExpired':
        return (
          <MapPanelMicroDateExpired
            targetUser={this.props.mapPanel.targetUser}
            mapPanel={this.props.mapPanel}
          />
        );
      case 'makeSelfie':
        return (
          <MapPanelMakeSelfie
            mapPanel={this.props.mapPanel}
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
