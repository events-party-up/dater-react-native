import * as React from 'react';
import {
  View,
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
import MapPanelActiveMicroDate from './map-panel-active-micro-date';
import MapPanelIncomingMicroDateRequest from './map-panel-incoming-micro-date-request';
import OnMapRightButtons from '../map/on-map-right-buttons';
import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../../constants';

import { calculateAgeFrom } from '../../utils/date-utils';

const mapStateToProps = (state) => ({
  mapPanel: state.mapPanel,
  uploadPhotos: state.uploadPhotos,
  microDate: state.microDate,
});

const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT - 75,
};

type Props = {
  mapPanel: any,
  microDate: any,
  dispatch: Dispatch,
  navigation: any,
  uploadPhotos: any,
  isAuthenticated: boolean,
  dispatch: Dispatch,
  locationIsEnabled: boolean,
  microDateIsEnabled: boolean,
  mapViewZoom: number,
  navigation: any,
};

type State = {
  deltaHeight: Animated.Value
}

class MapPanelComponent extends React.Component<Props, State> {
  interactableElement: Interactable.View;
  showSnapPosition = Platform.OS === 'ios' ? Screen.height - 100 : Screen.height - 130;
  showFullScreenSnapPosition = Platform.OS === 'ios' ? 20 : 8;
  showHalfScreenSnapPosition = (Screen.height / 2) + 50;
  closeSnapPosition = SCREEN_HEIGHT + 80;

  constructor(props) {
    super(props);
    this.state = {
      deltaHeight: new Animated.Value(this.closeSnapPosition),
    };
  }

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
              Запрос от {this.props.mapPanel.targetUser.name} {this.props.mapPanel.targetUser.birthday &&
                calculateAgeFrom(this.props.mapPanel.targetUser.birthday)} отменен
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
              {this.props.mapPanel.targetUser.name} {this.props.mapPanel.targetUser.birthday &&
                calculateAgeFrom(this.props.mapPanel.targetUser.birthday)} отменил встречу
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
      <React.Fragment>
        <Animated.View
          style={{
            bottom: this.state.deltaHeight.interpolate({
              // first value is for initial 0 value
              inputRange: [0, 1, Screen.height - 120, this.closeSnapPosition],
              outputRange: [32, 16 + 200, 200, 16],
              extrapolate: 'clamp',
              useNativeDriver: true,
            }),
            right: 0,
            position: 'absolute',
            zIndex: 1,
          }}
        >
          <OnMapRightButtons
            locationIsEnabled={this.props.locationIsEnabled}
            mapViewZoom={this.props.mapViewZoom}
            isAuthenticated={this.props.isAuthenticated}
            dispatch={this.props.dispatch}
            microDateIsEnabled={this.props.microDateIsEnabled}
          />
        </Animated.View>
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
              { y: this.closeSnapPosition, id: 'close' }, // close map panel snap point
            ]}
            boundaries={{ top: -300 }}
            initialPosition={{ y: this.closeSnapPosition }}
            animatedValueY={this.state.deltaHeight}
            onSnap={this.onSnap}
          >
            <View style={MapPanelStyles.panel}>
              <View style={MapPanelStyles.panelHandle} />
              {this.renderCard()}
            </View>
          </Interactable.View>
        </View>
      </React.Fragment>
    );
  }
}

export default connect(mapStateToProps)(MapPanelComponent);
