import * as React from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

import DaterModal from '../components/ui-kit/dater-modal';
import PastLocationsPath from '../components/map/past-locations-path';
import { MicroDate } from '../types';
import { SCREEN_WIDTH } from '../constants';

type Props = {
  navigation: any,
};

export default class TextInputsScreen extends React.Component<Props> {
  mapView: MapboxGL.MapView;
  microDate: MicroDate;
  mapIsReady = false;

  componentWillMount() {
    console.log(this.props.navigation.getParam('microDate'));
    this.microDate = this.props.navigation.getParam('microDate');
  }

  onMapReady = () => {
    this.mapIsReady = true;
    // this.mapView.fitBounds(
    //   [
    //     this.microDate.requestByGeoPoint.longitude, this.microDate.requestByGeoPoint.latitude,
    //   ],
    //   [
    //     this.microDate.requestForGeoPoint.longitude, this.microDate.requestForGeoPoint.latitude,
    //   ],
    // );
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
            zoomLevel={15}
            style={styles.mapView}
            animated={false}
            logoEnabled={false}
            compassEnabled={false}
            localizeLabels
            // onPress={() => { this.onMapPressed(); }}
            pitch={0}
            onWillStartLoadingMap={this.onMapReady}
            styleURL="mapbox://styles/olegwn/cjggmap8l002u2rmu63wda2nk"
            // scrollEnabled={false}
            // zoomEnabled={true}
            rotateEnabled={false}
            pitchEnabled={false}
            // minZoomLevel={11}
            // maxZoomLevel={18}
          >
            <PastLocationsPath
              uid={this.microDate.requestFor}
              mode="own"
              microDateId={this.microDate.id}
            />
            <PastLocationsPath
              uid={this.microDate.requestBy}
              mode="target"
              microDateId={this.microDate.id}
            />
          </MapboxGL.MapView>
        </ScrollView>
      </DaterModal>
    );
  }
}

const styles = StyleSheet.create({
  mapViewContainer: {
    paddingLeft: 8,
    paddingRight: 8,
  },
  scrollViewContainer: {
  },
  mapView: {
    // width: 300,
    height: SCREEN_WIDTH - 16,
  },
});
