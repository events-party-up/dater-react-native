import React from 'react';
import {
  StyleSheet,
  View,
} from 'react-native';
import { Marker, Circle } from 'react-native-maps';

const ANCHOR = { x: 0.5, y: 0.5 };
const SIZE: number = 25;
const HALO_RADIUS = 6;
const ARROW_SIZE = 7;
const ARROW_DISTANCE = 10;
const HALO_SIZE = SIZE + HALO_RADIUS;
const HEADING_BOX_SIZE = HALO_SIZE + ARROW_SIZE + ARROW_DISTANCE;
const colorOfmyLocationMapMarker = 'blue';

type Props = {
  heading: number,
  compassHeading: number,
  coordinate: {
    latitude: number,
    longitude: number,
    accuracy: number,
  }
};

class MyLocationMapMarker extends React.PureComponent<Props> {
  render() {
    // let { heading } = this.props;
    let { compassHeading } = this.props;
    const { coordinate } = this.props;
    if (compassHeading < 0 || !compassHeading) {
      compassHeading = 0;
    }
    const rotate = (typeof compassHeading === 'number' && compassHeading >= 0) ? `${compassHeading}deg` : null;
    return (
      <View
        style={styles.locationContainer}
        key={`coord${this.props.coordinate.latitude}-${this.props.coordinate.longitude}`}
      >
        <Circle
          center={{
            latitude: this.props.coordinate.latitude,
            longitude: this.props.coordinate.longitude,
          }}
          radius={coordinate.accuracy}
          strokeColor="#b0e0e6"
          fillColor="rgba(30,144,255,0.2)"
        />
        <Marker
          anchor={ANCHOR}
          style={styles.mapMarker}
          {...this.props}
          coordinate={coordinate}
        >
          <View style={styles.container}>
            <View style={styles.markerHalo} />
            {rotate &&
              <View style={[styles.heading, { transform: [{ rotate }] }]}>
                <View style={styles.headingPointer} />
              </View>
            }
            <View style={styles.marker} />
          </View>
        </Marker>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  mapMarker: {
    zIndex: 1000,
  },
  // The container is necessary to protect the markerHalo shadow from clipping
  container: {
    width: HEADING_BOX_SIZE,
    height: HEADING_BOX_SIZE,
  },
  heading: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: HEADING_BOX_SIZE,
    height: HEADING_BOX_SIZE,
    alignItems: 'center',
  },
  headingPointer: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderTopWidth: 0,
    borderRightWidth: ARROW_SIZE * 0.75,
    borderBottomWidth: ARROW_SIZE,
    borderLeftWidth: ARROW_SIZE * 0.75,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: colorOfmyLocationMapMarker,
    borderLeftColor: 'transparent',
  },
  markerHalo: {
    position: 'absolute',
    backgroundColor: 'white',
    top: 0,
    left: 0,
    width: HALO_SIZE,
    height: HALO_SIZE,
    borderRadius: Math.ceil(HALO_SIZE / 2),
    margin: (HEADING_BOX_SIZE - HALO_SIZE) / 2,
    shadowColor: 'black',
    shadowOpacity: 0.25,
    shadowRadius: 2,
    shadowOffset: {
      height: 0,
      width: 0,
    },
  },
  marker: {
    justifyContent: 'center',
    backgroundColor: colorOfmyLocationMapMarker,
    width: SIZE,
    height: SIZE,
    borderRadius: Math.ceil(SIZE / 2),
    margin: (HEADING_BOX_SIZE - SIZE) / 2,
  },
});

export default MyLocationMapMarker;
