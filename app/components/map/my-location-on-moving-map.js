import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Dimensions,
} from 'react-native';

const SIZE: number = 25;
const HALO_RADIUS = 6;
const ARROW_SIZE = 7;
const ARROW_DISTANCE = 10;
const HALO_SIZE = SIZE + HALO_RADIUS;
const HEADING_BOX_SIZE = HALO_SIZE + ARROW_SIZE + ARROW_DISTANCE;
const colorOfmyLocationMapMarker = 'red';
const { width, height } = Dimensions.get('window');
const DIAGONAL = Math.sqrt((width * width) + (height * height));

type Props = {
  accuracy: number,
  visibleRadiusInMeters: number,
};

class MyLocationOnMovingMap extends React.PureComponent<Props> {
  render() {
    const { accuracy } = this.props;
    // const accuracy = 80;
    const { visibleRadiusInMeters } = this.props;
    const pixelsPerMeter = DIAGONAL / (visibleRadiusInMeters * 2);
    const RADIUS = pixelsPerMeter * accuracy;
    // console.log(`Visible radius: ${visibleRadiusInMeters}, DIAGONAL: ${DIAGONAL}, pixelsPerMeter: ${pixelsPerMeter}, Radius: ${RADIUS}`);

    return (
      <View
        style={styles.locationContainer}
        pointerEvents="none"
      >
        <View style={{
          backgroundColor: 'rgba(30,144,255,0.2)',
          width: RADIUS * 2,
          height: RADIUS * 2,
          borderRadius: Math.ceil(RADIUS),
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
          zIndex: 1,
          borderWidth: 1,
        }}
        />
        <View style={styles.container}>
          <View style={styles.markerHalo} />
          <View style={styles.heading}>
            <View style={styles.headingPointer} />
          </View>
          <View style={styles.marker} />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  locationContainer: {
    marginTop: Platform.OS === 'ios' ? 10 : 0, // adjust status bar for iOS, need 10 for iPhone X
    position: 'absolute',
    right: 0,
    left: 0,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // The container is necessary to protect the markerHalo shadow from clipping
  container: {
    zIndex: 2,
    width: HEADING_BOX_SIZE,
    height: HEADING_BOX_SIZE,
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

  marker: {
    justifyContent: 'center',
    backgroundColor: colorOfmyLocationMapMarker,
    width: SIZE,
    height: SIZE,
    borderRadius: Math.ceil(SIZE / 2),
    margin: (HEADING_BOX_SIZE - SIZE) / 2,
  },
});

export default MyLocationOnMovingMap;
