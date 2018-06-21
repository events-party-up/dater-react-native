import * as React from 'react';
import { ScrollView, StyleSheet, View, Image } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import Moment from 'react-moment';

import DaterModal from '../components/ui-kit/organisms/dater-modal';
import PastLocationsPath from '../components/map/past-locations-path';
import { MicroDate } from '../types';
import { SCREEN_WIDTH } from '../constants';
import { Body } from '../components/ui-kit/atoms/typography';
import CardInfoItemMolecule from '../components/ui-kit/molecules/card-info-item-molecule';
import UserOnMapMarker from '../components/map/user-on-map-marker';

const coinIcon = require('../assets/icons/coin/16/coin.png');

type Props = {
  navigation: any,
};

export default class MicroDateScreen extends React.Component<Props> {
  mapView: MapboxGL.MapView;
  microDate: MicroDate;
  mapIsReady = false;
  microDateDuration: number;
  finishTS: Date;

  componentWillMount() {
    this.microDate = this.props.navigation.getParam('microDate');
    this.finishTS = this.microDate.finishTS ? this.microDate.finishTS : new Date();
    this.microDateDuration =
      Math.floor((this.finishTS.getTime() - this.microDate.acceptTS.getTime()) / 1000 / 60);
    this.microDateDuration = this.microDateDuration <= 0 ? 1 : this.microDateDuration; // reset to 1 if duration is too small
  }

  onSelfieMarkerPress = () => {
    this.props.navigation.navigate('FullscreenPhotoScreen', {
      photo: {
        publicId: `microDates/${this.microDate.id}`,
        version: this.microDate.selfie.version,
      },
    });
  }

  onMapReady = () => {
    this.mapIsReady = true;
  }

  render() {
    return (
      <DaterModal
        fullscreen
        closeButton
        closeButtonPress={() => this.props.navigation.goBack()}
        headerTitle="Карточка встречи"
        style={styles.mapViewContainer}
      >
        <ScrollView
          style={styles.scrollViewContainer}
        >
          <MapboxGL.MapView
            centerCoordinate={[
              this.microDate.selfieGeoPoint.longitude,
              this.microDate.selfieGeoPoint.latitude,
            ]}
            ref={(component) => { this.mapView = component; }}
            showUserLocation={false}
            userTrackingMode={0}
            zoomLevel={16}
            style={styles.mapView}
            animated={false}
            logoEnabled={false}
            compassEnabled={false}
            localizeLabels
            // onPress={() => { this.onMapPressed(); }}
            pitch={0}
            onWillStartLoadingMap={this.onMapReady}
            styleURL="mapbox://styles/olegwn/cjggmap8l002u2rmu63wda2nk"
            scrollEnabled={false}
            // zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
            minZoomLevel={11}
            maxZoomLevel={18}
          >
            <PastLocationsPath
              lastLocation={this.microDate.selfieGeoPoint}
              uid={this.microDate.requestFor}
              mode="own"
              microDateId={this.microDate.id}
              limit={100}
            />
            <PastLocationsPath
              lastLocation={this.microDate.selfieGeoPoint}
              uid={this.microDate.requestBy}
              mode="target"
              microDateId={this.microDate.id}
              limit={100}
            />
            <MapboxGL.PointAnnotation
              coordinate={[
                this.microDate.selfieGeoPoint.longitude,
                this.microDate.selfieGeoPoint.latitude,
              ]}
              key={this.microDate.id}
              id={this.microDate.id}
              selected={false}
              anchor={{ x: 0.5, y: 1 }}
            >
              <UserOnMapMarker
                type="microDate"
                onPress={this.onSelfieMarkerPress}
                photo={
                  {
                    // public_id: `microDates/${this.microDate.id}`,
                    publicId: `microDates/${this.microDate.id}`,
                    version: this.microDate.selfie.version,
                  }
                }
              />
            </MapboxGL.PointAnnotation>
          </MapboxGL.MapView>
          {/* <H2 style={[styles.subHeader, styles.textBodyPadding]}>Карточка встречи</H2> */}
          <Body
            style={[styles.bodyText, styles.textBodyPadding]}
          >
            Встреча {this.microDate.id.substring(0, 4)} состоялась{' '}
            <Moment locale="ru" element={Body} fromNow>{this.finishTS}</Moment>{' '}
            между {this.microDate.requestBy.substring(0, 4)} и {this.microDate.requestFor.substring(0, 4)}{' '}
          </Body>
          <View style={{
             flexDirection: 'row',
            }}
          >
            <CardInfoItemMolecule
              style={[styles.bodyText, styles.textBodyPadding]}
              header="Добыто"
              bodyStyle={{
                paddingLeft: 0,
              }}
            >
              <View style={styles.coinIcon}>
                <Image source={coinIcon} />
              </View>
              1500
            </CardInfoItemMolecule>
            <CardInfoItemMolecule
              style={[styles.bodyText, styles.textBodyPadding]}
              header={this.microDate.requestBy.substring(0, 4)}
              bodyStyle={{
                paddingLeft: 0,
              }}
            >
              <View style={styles.coinIcon}>
                <Image source={coinIcon} />
              </View>
              1000
            </CardInfoItemMolecule>
            <CardInfoItemMolecule
              style={[styles.bodyText, styles.textBodyPadding]}
              header={this.microDate.requestFor.substring(0, 4)}
              bodyStyle={{
                paddingLeft: 0,
              }}
            >
              <View style={styles.coinIcon}>
                <Image source={coinIcon} />
              </View>
              500
            </CardInfoItemMolecule>
          </View>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            bodyStyle={{
              color: this.microDate.moderationStatus === 'PENDING' && '#354DFF',
            }}
            header="Статус:"
          >
            Ожидает подтверждения
          </CardInfoItemMolecule>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            header="Время выполнения квеста:"
          >
            {this.microDateDuration} мин.
          </CardInfoItemMolecule>
          <View style={styles.bottomButtonsPad} />
        </ScrollView>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  mapViewContainer: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  scrollViewContainer: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  mapView: {
    height: SCREEN_WIDTH - 16,
    marginBottom: 8,
  },
  subHeader: {
    marginBottom: 8,
  },
  bodyText: {
    marginBottom: 8,
  },
  textBodyPadding: {
    paddingLeft: 16,
    paddingRight: 16,
  },
  coinIcon: {
    // paddingLeft: 16,
  },
  bottomButtonsPad: {
    height: 96,
  },
});
