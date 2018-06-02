import * as React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import Moment from 'react-moment';

import DaterModal from '../components/ui-kit/dater-modal';
import PastLocationsPath from '../components/map/past-locations-path';
import { MicroDate } from '../types';
import { SCREEN_WIDTH } from '../constants';
import { H2, Body } from '../components/ui-kit/typography';
import CardInfoItemMolecule from '../components/ui-kit/molecules/card-info-item-molecule';
import UserOnMapMarker from '../components/map/user-on-map-marker';

type Props = {
  navigation: any,
};

export default class TextInputsScreen extends React.Component<Props> {
  mapView: MapboxGL.MapView;
  microDate: MicroDate;
  mapIsReady = false;
  microDateDuration: number;

  componentWillMount() {
    console.log(this.props.navigation.getParam('microDate'));
    this.microDate = this.props.navigation.getParam('microDate');
    this.microDateDuration =
      Math.floor((this.microDate.finishTS.getTime() - this.microDate.acceptTS.getTime()) / 1000 / 60);
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
              uid={this.microDate.requestFor}
              mode="own"
              microDateId={this.microDate.id}
              isLimited={false}
            />
            <PastLocationsPath
              uid={this.microDate.requestBy}
              mode="target"
              microDateId={this.microDate.id}
              isLimited={false}
            />
            <MapboxGL.PointAnnotation
              coordinate={[
                this.microDate.selfieGeoPoint.longitude,
                this.microDate.selfieGeoPoint.latitude,
              ]}
              key={this.microDate.id}
              id={this.microDate.id}
              selected={false}
            >
              <UserOnMapMarker
                type="microDate"
                photo={
                  {
                    // public_id: `microDates/${this.microDate.id}`,
                    public_id: `microDates/${this.microDate.id}1`,
                    version: this.microDate.selfie.version,
                  }
                }
              />
            </MapboxGL.PointAnnotation>
          </MapboxGL.MapView>
          <H2 style={[styles.subHeader, styles.textBodyPadding]}>Карточка встречи</H2>
          <Body
            style={[styles.bodyText, styles.textBodyPadding]}
          >
            Встреча {this.microDate.id.substring(0, 4)} состоялась{' '}
            <Moment locale="ru" element={Body} fromNow>{this.microDate.finishTS}</Moment>{' '}
            между {this.microDate.requestBy.substring(0, 4)} и {this.microDate.requestFor.substring(0, 4)}{' '}
          </Body>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            header="Статус:"
          >
            Ожидает подтверждения
          </CardInfoItemMolecule>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            header="Время выполнения квеста:"
          >
            {this.microDateDuration} минут
          </CardInfoItemMolecule>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            header="Добыто монет:"
          >
            1500 coins
          </CardInfoItemMolecule>
          <CardInfoItemMolecule
            style={[styles.bodyText, styles.textBodyPadding]}
            header="Набрано опыта:"
          >
            140 XP
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
  bottomButtonsPad: {
    height: 96,
  },
});
