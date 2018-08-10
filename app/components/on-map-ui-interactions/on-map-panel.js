import * as React from 'react';
import { View } from 'react-native';
import 'moment/locale/ru';

import MapPanelStyles from './map-panel-templates/map-panel-styles';

import MapPanelSelfieUploading from './map-panel-templates/map-panel-selfie-uploading';
import MapPanelSelfieUploadedByMe from './map-panel-templates/map-panel-selfie-uploaded-by-me';
import MapPanelSelfieUploadedByTarget from './map-panel-templates/map-panel-selfie-uploaded-by-target';
import MapPanelMakeSelfie from './map-panel-templates/map-panel-make-selfie';
import MapPanelActiveMicroDate from './map-panel-templates//map-panel-active-micro-date';
import MapPanelMicroDateStopped from './map-panel-templates/map-panel-micro-date-stopped';
import MapPanelMicroDateExpired from './map-panel-templates/map-panel-micro-date-expired';
import MapPanelAreYouReady from './map-panel-templates/map-panel-are-you-ready';
import MapPanelPendingSearch from './map-panel-templates/map-panel-pending-search';
import MapPanelIAmReadyExpired from './map-panel-templates/map-panel-i-am-ready-expired';

type Props = {
  mapPanel: any,
  microDate: any,
  usersAroundReadyToDateCount: number,
  usersAroundCount: number,
  uploadPhotos: any,
  onPressHandle: () => void,
};

type State = {
}

export default class OnMapPanel extends React.Component<Props, State> {
  renderCard() {
    switch (this.props.mapPanel.mode) {
      case 'areYouReady':
        return (
          <MapPanelAreYouReady
            mapPanel={this.props.mapPanel}
            usersAroundReadyToDateCount={this.props.usersAroundReadyToDateCount}
            usersAroundCount={this.props.usersAroundCount}
          />
        );
      case 'pendingSearch':
        return (
          <MapPanelPendingSearch
            mapPanel={this.props.mapPanel}
          />
        );
      case 'iAmReadyExpired':
        return (
          <MapPanelIAmReadyExpired />
        );
      case 'activeMicroDate':
        return (
          <MapPanelActiveMicroDate
            targetUser={this.props.mapPanel.targetUser}
            distance={this.props.microDate.distance}
            acceptTS={this.props.mapPanel.microDate.acceptTS}
          />
        );
      case 'microDateStopped':
        return (
          <MapPanelMicroDateStopped
            targetUser={this.props.mapPanel.targetUser}
            stopTS={this.props.mapPanel.microDate.stopTS}
          />
        );
      case 'microDatetExpired':
        return (
          <MapPanelMicroDateExpired
            targetUser={this.props.mapPanel.targetUser}
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
        <View
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
