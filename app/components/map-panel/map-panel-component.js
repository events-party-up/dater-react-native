import React, { Component } from 'react';
import {
  View,
  Dimensions,
  Animated,
  Platform,
} from 'react-native';
import Interactable from 'react-native-interactable';
import 'moment/locale/ru';
import Moment from 'react-moment';
import { connect, Dispatch } from 'react-redux';

import MapPanelStyles from './map-panel-styles';

import { H2, Caption2 } from '../../components/ui-kit/atoms/typography';
import DaterButton from '../../components/ui-kit/atoms/dater-button';
import MapPanelSelfieUploading from './map-panel-selfie-uploading';
import MapPanelSelfieUploadedByMe from './map-panel-selfie-uploaded-by-me';
import MapPanelSelfieUploadedByTarget from './map-panel-selfie-uploaded-by-target';
import MapPanelUserCard from './map-panel-user-card';
import MapPanelMakeSelfie from './map-panel-make-selfie';

import { calculateAgeFrom } from '../../utils/date-utils';

const mapStateToProps = (state) => ({
  mapPanel: state.mapPanel,
  uploadPhotos: state.uploadPhotos,
  microDate: state.microDate,
});

const Screen = {
  width: Dimensions.get('window').width,
  height: Dimensions.get('window').height - 75,
};

type Props = {
  mapPanel: any,
  microDate: any,
  dispatch: Dispatch,
  navigation: any,
  uploadPhotos: any,
};

class MapPanelComponent extends Component<Props> {
  _deltaY: Animated.Value;
  panViewBottom: Animated.Value;
  interactableElement: Interactable.View;
  showSnapPosition = Platform.OS === 'ios' ? Screen.height - 100 : Screen.height - 130;
  showFullScreenSnapPosition = Platform.OS === 'ios' ? 20 : 8;
  showHalfScreenSnapPosition = (Screen.height / 2) + 50;

  componentDidMount() {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_READY',
      mapPanelSnapper: (args) => this.interactableElement.snapTo(args),
    });
  }

  componentWillUnmount() {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_UNLOAD',
    });
  }

  onSnap = (event) => {
    if (event && event.nativeEvent && event.nativeEvent.id === 'close') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_SNAPPED' });
    } else if (event && event.nativeEvent && event.nativeEvent.id === 'showStandard') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_SHOW_SNAPPED' });
    } else if (event && event.nativeEvent && event.nativeEvent.id === 'showHalfScreen') {
      this.props.dispatch({ type: 'UI_MAP_PANEL_SHOW_HALF_SCREEN_SNAPPED' });
    }
  }

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
      routeName: 'MakePhotoSelfie',
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
          <View>
            <H2 style={MapPanelStyles.panelHeader}>Встеча с{' '}
              {this.props.mapPanel.targetUser.name} {this.props.mapPanel.targetUser.birthday &&
                calculateAgeFrom(this.props.mapPanel.targetUser.birthday)}
            </H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              Расстояние {Math.floor(this.props.mapPanel.distance)} м.{' '}
              Date ID: {this.props.microDate.id && this.props.microDate.id.substring(0, 4)}{' '}
              User ID: ({this.props.mapPanel.targetUser.id.substring(0, 4)} )
            </Caption2>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}
            >
              <DaterButton
                style={[MapPanelStyles.panelButton, { width: 130 }]}
                onPress={this.stopMicroDate}
              >
                Отменить
              </DaterButton>
              <DaterButton
                style={[MapPanelStyles.panelButton, { width: 130 }]}
                onPress={this.showMeTargetUser}
              >
                Найти
              </DaterButton>
            </View>
          </View>
        );
      case 'incomingMicroDateRequest':
        return (
          <View>
            <H2 style={MapPanelStyles.panelHeader}>
              Запрос от {this.props.mapPanel.targetUser.name} {this.props.mapPanel.targetUser.birthday &&
              calculateAgeFrom(this.props.mapPanel.targetUser.birthday)}
            </H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              Расстояние {Math.floor(this.props.mapPanel.distance)} м.{'\n'}
              User ID: {this.props.mapPanel.targetUser.shortId}{' '}
              Date ID: {this.props.mapPanel.microDateId.substring(0, 4)}
            </Caption2>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
            }}
            >
              <DaterButton
                style={[MapPanelStyles.panelButton, { width: 130 }]}
                onPress={this.declineIncomingMicroDate}
              >
                Отклонить
              </DaterButton>
              <DaterButton
                style={[MapPanelStyles.panelButton, { width: 130 }]}
                onPress={this.acceptIncomingMicroDate}
              >
                Принять
              </DaterButton>
            </View>
          </View>
        );
      case 'outgoingMicroDateAwaitingAccept':
        return (
          <View>
            <H2 style={MapPanelStyles.panelHeader}>Ожидание ответа</H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              Запрос на встречу с {this.props.mapPanel.targetUser.name} {this.props.mapPanel.targetUser.birthday &&
                calculateAgeFrom(this.props.mapPanel.targetUser.birthday)} отправлен{' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.requestTS}</Moment>.{'\n'}
              Date ID: {this.props.mapPanel.microDate.id.substring(0, 4)}{' '}
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
              Запрос отклонен
            </H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              {this.props.mapPanel.targetUser.name} {this.props.mapPanel.targetUser.birthday &&
                calculateAgeFrom(this.props.mapPanel.targetUser.birthday)} отклонил запрос на встречу{' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.declineTS}</Moment>.{'\n'}
              Date ID: {this.props.mapPanel.microDate.id.substring(0, 4)}
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
              Запрос от {this.props.mapPanel.microDate.requestBy.substring(0, 4)} отменен
            </H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              Запрос {this.props.mapPanel.microDate.id.substring(0, 4)} был отменен{' '}
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
              {this.props.mapPanel.microDate.stopBy.substring(0, 4)} отменил встречу
            </H2>
            <Caption2 style={MapPanelStyles.panelBody}>
              Встреча ({this.props.mapPanel.microDate.id.substring(0, 4)}) отменена {' '}
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
            targetUserUid={this.props.mapPanel.microDate.selfie.uploadedBy ===
              this.props.mapPanel.microDate.requestFor ?
              this.props.mapPanel.microDate.requestBy :
              this.props.mapPanel.microDate.requestFor
            }
          />
        );
      case 'selfieUploadedByTarget':
        return (
          <MapPanelSelfieUploadedByTarget
            aspectRatio={this.props.mapPanel.microDate.selfie.width / this.props.mapPanel.microDate.selfie.height}
            cloudinaryPublicId={this.props.mapPanel.microDate.id}
            cloudinaryImageVersion={this.props.mapPanel.microDate.selfie.version}
            targetUserUid={this.props.mapPanel.microDate.requestBy}
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
      <View
        style={MapPanelStyles.panelContainer}
        pointerEvents="box-none"
      >
        <Interactable.View
          ref={(component) => { this.interactableElement = component; }}
          verticalOnly
          snapPoints={[
              { y: this.showSnapPosition, id: 'showStandard' },
              { y: this.showHalfScreenSnapPosition, id: 'showHalfScreen' },
              { y: this.showFullScreenSnapPosition, id: 'showFullScreen' },
              { y: Screen.height + 80, id: 'close' }, // close map panel snap point
            ]}
          boundaries={{ top: -300 }}
          initialPosition={{ y: Screen.height + 80 }}
          animatedValueY={this._deltaY}
          onSnap={this.onSnap}
        >
          <View style={MapPanelStyles.panel}>
            <View style={MapPanelStyles.panelHandle} />
            {this.renderCard()}
          </View>
        </Interactable.View>
      </View>
    );
  }
}

export default connect(mapStateToProps)(MapPanelComponent);
