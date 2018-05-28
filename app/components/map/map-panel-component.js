import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Animated,
  Platform,
  Image,
} from 'react-native';
import Interactable from 'react-native-interactable';
import 'moment/locale/ru';
import Moment from 'react-moment';
import { connect, Dispatch } from 'react-redux';

import { H2, Caption2, Body } from '../../components/ui-kit/typography';
import DaterButton from '../../components/ui-kit/dater-button';

const mapStateToProps = (state) => ({
  mapPanel: state.mapPanel,
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
};

class MapPanelComponent extends Component<Props> {
  _deltaY: Animated.Value;
  panViewBottom: Animated.Value;
  interactableElement: Interactable.View;
  showSnapPosition = Platform.OS === 'ios' ? Screen.height - 100 : Screen.height - 130;
  showFullScreenSnapPosition = Platform.OS === 'ios' ? 20 : 8;
  showHalfScreenSnapPosition = Platform.OS === 'ios' ? (Screen.height / 2) - 20 : (Screen.height / 2) - 8;

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
    if (event && event.nativeEvent &&
      (event.nativeEvent.id === 'close') && this.props.mapPanel.visible === true) {
      this.props.dispatch({ type: 'UI_MAP_PANEL_HIDE_FINISHED' });
    }
  }

  showMeTargetUser = () => {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_HIDE',
      payload: {
        source: 'mapPanelShowMeTargetUser',
      },
    });
    this.props.dispatch({ type: 'MAPVIEW_SHOW_ME_AND_TARGET_MICRO_DATE' });
  }

  requestMicroDate = (user) => {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_HIDE',
      payload: {
        source: 'mapPanelRequestMicroDate',
      },
    });
    this.props.dispatch({
      type: 'MICRO_DATE_OUTGOING_REQUEST',
      payload: {
        user,
      },
    });
  }

  cancelOutgoingMicroDate = () => {
    this.props.dispatch({ type: 'MICRO_DATE_OUTGOING_CANCEL' });
    this.props.dispatch({
      type: 'UI_MAP_PANEL_HIDE_FORCE',
      payload: {
        source: 'mapPanelCancelOutgoingMicroDate',
      },
    });
  }

  acceptIncomingMicroDate = () => {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_HIDE_FORCE',
      payload: {
        source: 'mapPanelAcceptIncomingMicroDate',
      },
    });
    this.props.dispatch({
      type: 'MICRO_DATE_INCOMING_ACCEPT',
    });
  }

  declineIncomingMicroDate = () => {
    this.props.dispatch({
      type: 'MICRO_DATE_INCOMING_DECLINE_BY_ME',
    });
    this.props.dispatch({
      type: 'UI_MAP_PANEL_HIDE_FORCE',
      payload: {
        source: 'mapPanelDeclineIncomingMicroDate',
      },
    });
  }

  stopMicroDate = () => {
    this.props.dispatch({ type: 'MICRO_DATE_STOP' });
    this.props.dispatch({
      type: 'UI_MAP_PANEL_HIDE_FORCE',
      payload: {
        source: 'mapPanelStopMicroDate',
      },
    });
  }

  openCamera = () => {
    this.props.navigation.navigate('MakePhotoSelfie');
  }

  closePanel = () => {
    this.props.dispatch({
      type: 'UI_MAP_PANEL_HIDE',
      payload: {
        source: 'mapPanelClosePanel',
      },
    });
  }

  renderCard() {
    switch (this.props.mapPanel.mode) {
      case 'userCard':
        return (
          <View>
            <H2 style={styles.panelHeader}>Пользователь ({this.props.mapPanel.user.shortId} )</H2>
            <Caption2 style={styles.panelBody}>
              {Math.floor(this.props.mapPanel.user.distance)} метров от вас. {' '}
              Был <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.user.timestamp}</Moment>.
            </Caption2>
            <DaterButton style={styles.panelButton} onPress={() => this.requestMicroDate(this.props.mapPanel.user)}>
              Встретиться
            </DaterButton>
          </View>
        );
      case 'activeMicroDate':
        return (
          <View>
            <H2 style={styles.panelHeader}>Встеча с {this.props.microDate.targetUserUid &&
              this.props.microDate.targetUserUid.substring(0, 4)} активна
            </H2>
            <Caption2 style={styles.panelBody}>
              Расстояние {Math.floor(this.props.mapPanel.distance)} м. {' '}
              Date ID: {this.props.microDate.id && this.props.microDate.id.substring(0, 4)}
            </Caption2>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
              }}
            >
              <DaterButton
                style={[styles.panelButton, { width: 130 }]}
                onPress={this.stopMicroDate}
              >
                Отменить
              </DaterButton>
              <DaterButton
                style={[styles.panelButton, { width: 130 }]}
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
            <H2 style={styles.panelHeader}>Запрос от {this.props.mapPanel.user.shortId}</H2>
            <Caption2 style={styles.panelBody}>
              Расстояние {Math.floor(this.props.mapPanel.distance)} м. {' '}
              Date ID: {this.props.mapPanel.microDateId.substring(0, 4)}
            </Caption2>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-evenly',
            }}
            >
              <DaterButton
                style={[styles.panelButton, { width: 130 }]}
                onPress={this.declineIncomingMicroDate}
              >
                Отклонить
              </DaterButton>
              <DaterButton
                style={[styles.panelButton, { width: 130 }]}
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
            <H2 style={styles.panelHeader}>Ожидание ответа</H2>
            <Caption2 style={styles.panelBody}>
              Запрос {this.props.mapPanel.microDate.id.substring(0, 4)} к{' '}
              {this.props.mapPanel.microDate.requestFor.substring(0, 4)} отправлен{' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.requestTS}</Moment>
            </Caption2>
            <DaterButton
              style={styles.panelButton}
              onPress={this.cancelOutgoingMicroDate}
            >
              Отменить
            </DaterButton>
          </View>
        );
      case 'outgoingMicroDateDeclined':
        return (
          <View>
            <H2 style={styles.panelHeader}>Запрос к {this.props.mapPanel.microDate.requestFor.substring(0, 4)} отклонен
            </H2>
            <Caption2 style={styles.panelBody}>
              Запрос {this.props.mapPanel.microDate.id.substring(0, 4)} был отклонен{' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.declineTS}</Moment>.
            </Caption2>
            <DaterButton style={styles.panelButton} onPress={this.closePanel}>
              ОК
            </DaterButton>
          </View>
        );
      case 'incomingMicroDateCancelled':
        return (
          <View>
            <H2 style={styles.panelHeader}>Запрос от {this.props.mapPanel.microDate.requestBy.substring(0, 4)} отменен
            </H2>
            <Caption2 style={styles.panelBody}>
              Запрос {this.props.mapPanel.microDate.id.substring(0, 4)} был отменен{' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.cancelRequestTS}</Moment>.
            </Caption2>
            <DaterButton style={styles.panelButton} onPress={this.closePanel}>
              ОК
            </DaterButton>
          </View>
        );
      case 'microDateStopped':
        return (
          <View>
            <H2 style={styles.panelHeader}>{this.props.mapPanel.microDate.stopBy.substring(0, 4)} отменил встречу
            </H2>
            <Caption2 style={styles.panelBody}>
              Встреча ({this.props.mapPanel.microDate.id.substring(0, 4)}) отменена {' '}
              <Moment locale="ru" element={Caption2} fromNow>{this.props.mapPanel.microDate.stopTS}</Moment>.
            </Caption2>
            <DaterButton style={styles.panelButton} onPress={this.closePanel}>
              ОК
            </DaterButton>
          </View>
        );
      case 'makeSelfie':
        return (
          <View>
            <H2 style={styles.panelHeader}>Сделайте селфи с {this.props.microDate.targetUserUid &&
              this.props.microDate.targetUserUid.substring(0, 4)}!
            </H2>
            <Caption2 style={styles.panelBody}>
              Для завершения встречи сделайте совместное селфи.
            </Caption2>
            <DaterButton style={styles.panelButton} onPress={this.openCamera}>
              Камера
            </DaterButton>
          </View>
        );
      case 'selfieUploading':
        return (
          <View>
            <View>
              <View style={{
                marginRight: 16,
                paddingRight: 16,
                marginTop: 8,
                flexDirection: 'row',
              }}
              >
                <Image
                  style={{
                    height: 112,
                    alignSelf: 'flex-start',
                    // height: 112 * this.props.mapPanel.uploadSelfie.aspectRatio,
                    aspectRatio: this.props.mapPanel.uploadSelfie.aspectRatio,
                    borderRadius: 4,
                  }}
                  source={{ uri: this.props.mapPanel.uploadSelfie.photoURI }}
                // source={{ uri: 'https://res.cloudinary.com/dater/image/upload/v1527447895/microDates/microDateId.jpg' }}
                />
                <View style={{
                  flexDirection: 'column',
                  marginLeft: 16,
                  marginRight: 26,
                }}
                >
                  <H2>Загрузка фото
                  </H2>
                  <Caption2 style={{
                    marginTop: 8,
                    marginRight: 16,
                    paddingRight: 16,
                  }}
                  >
                    Ожидайте, идет загрузка фото на сервер.
                  </Caption2>
                  <View style={{
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                    flex: 1,
                  }}
                  >
                    <Body style={{
                      alignSelf: 'flex-start',
                    }}
                    >
                      Прогресс 5%
                    </Body>
                  </View>
                </View>
              </View>
            </View>
            {/* <DaterButton style={styles.panelButton} onPress={this.openCamera}>
              Отменить
            </DaterButton> */}
          </View>
        );
      default:
        return null;
    }
  }

  render() {
    return (
      <View
        style={styles.panelContainer}
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
          <View style={styles.panel}>
            <View style={styles.panelHandle} />
            {this.renderCard()}
          </View>
        </Interactable.View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 4,
  },
  panel: {
    height: Screen.height + 300,
    padding: 8,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderRadius: 4,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowRadius: 4,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 0,
    },
    elevation: 1,
  },
  panelHeader: {
    marginLeft: 16,
  },
  panelBody: {
    marginLeft: 16,
    marginBottom: 8,
    marginTop: 8,
  },
  panelHandle: {
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
    alignSelf: 'center',
  },
  panelButton: {
    alignItems: 'center',
    marginVertical: 8,
    alignSelf: 'center',
  },
});

export default connect(mapStateToProps)(MapPanelComponent);
