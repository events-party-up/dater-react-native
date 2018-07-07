import React from 'react';
import {
  StyleSheet,
  View,
  Platform,
  Dimensions,
  Animated,
} from 'react-native';

import { wrapCompassHeading } from '../../utils/geo-utils';
import { MICRO_DATE_MAPMAKER_POSITIVE_THRESHOLD_ANGLE } from '../../constants';

const SIZE: number = 17;
const HALO_RADIUS = 5;
const ARROW_SIZE = 7;
const ARROW_DISTANCE = 10;
const HALO_SIZE = SIZE + HALO_RADIUS;
const HEADING_BOX_SIZE = HALO_SIZE + ARROW_SIZE + ARROW_DISTANCE;
const colorOfmyLocationMapMarker = '#1F8BFF'; // '#2c7cf6';
const poorGPSMarkerColor = '#BDBDBD';
const defaultColorOfHalo = 'rgba(30,144,255,0.2)';
const poorGPSColorOfHalo = 'rgba(235, 87, 87, 0.4)';
const { width, height } = Dimensions.get('window');
const DIAGONAL = Math.sqrt((width * width) + (height * height));

type State = {
  gpsAccuracyRadius: Animated.Value,
}

type Props = {
  accuracy: number,
  visibleRadiusInMeters: number,
  heading: number,
  mapViewHeadingAngle: number,
  mapViewModeIsSwitching: boolean,
  headingToTarget: number,
  microDateEnabled: boolean,
  appState: any,
};

export default class MyLocationOnCenteredMap extends React.PureComponent<Props, State> {
  badGpsAnimation;

  constructor(props) {
    super(props);
    this.state = {
      gpsAccuracyRadius: new Animated.Value(0),
    };
  }

  componentWillMount() {
    this.animateAccuracyHalo(this.props.accuracy);

    this.badGpsAnimation = Animated.loop(Animated.sequence([
      Animated.timing(this.state.gpsAccuracyRadius, {
        toValue: 60,
        duration: 1000,
      }),
      Animated.timing(this.state.gpsAccuracyRadius, {
        toValue: 10,
        duration: 1000,
      }),
      Animated.timing(this.state.gpsAccuracyRadius, {
        toValue: 60,
        duration: 1000,
      }),
      Animated.timing(this.state.gpsAccuracyRadius, {
        toValue: 10,
        duration: 1000,
      }),
      Animated.delay(3000),
    ]));
  }

  componentWillReceiveProps(nextProps) {
    if ((nextProps.accuracy !== this.props.accuracy ||
        nextProps.visibleRadiusInMeters !== this.props.visibleRadiusInMeters) &&
        !this.props.appState.gpsIsPoor) {
      this.animateAccuracyHalo(nextProps.accuracy);
    }

    if (this.props.appState.gpsIsPoor === nextProps.appState.gpsIsPoor) return;
    if (nextProps.appState.gpsIsPoor) {
      this.badGpsAnimation.start();
    } else {
      this.badGpsAnimation.stop();
      this.badGpsAnimation.reset();
      this.animateAccuracyHalo(this.props.accuracy);
    }
  }

  animateAccuracyHalo(accuracy) {
    Animated.timing(this.state.gpsAccuracyRadius, {
      toValue: this.getAccuracyRadius(accuracy),
      duration: 500,
    }).start();
  }

  getAccuracyRadius(accuracy) {
    const { visibleRadiusInMeters } = this.props;
    const pixelsPerMeter = DIAGONAL / (visibleRadiusInMeters * 2);
    const RADIUS = pixelsPerMeter * accuracy;
    return RADIUS;
  }

  render() {
    // console.log(`Visible radius: ${visibleRadiusInMeters}, DIAGONAL: ${DIAGONAL}, pixelsPerMeter: ${pixelsPerMeter}, Radius: ${RADIUS}`);
    const rotation = (this.props.heading || 0) - (this.props.mapViewHeadingAngle || 0); // zeros protect from undefined values
    const rotate = `${rotation}deg`;
    const rotationTarget = (this.props.headingToTarget || 0) - (this.props.mapViewHeadingAngle || 0); // zeros protect from undefined values
    const rotateTarget = `${rotationTarget}deg`;
    const deltaMeAndTargetHeading =
      Math.abs(wrapCompassHeading(wrapCompassHeading(this.props.heading) -
               wrapCompassHeading(this.props.headingToTarget)));
    const microDateMarkerColor =
      deltaMeAndTargetHeading <= MICRO_DATE_MAPMAKER_POSITIVE_THRESHOLD_ANGLE ? '#3DB770' : '#EB5757';

    const markerColor = (this.props.appState.gpsIsPoor && poorGPSMarkerColor) ||
                        (this.props.microDateEnabled && microDateMarkerColor) ||
                      colorOfmyLocationMapMarker;
    const colorOfHalo = (this.props.appState.gpsIsPoor && poorGPSColorOfHalo) || defaultColorOfHalo;

    return (
      <View
        style={styles.locationContainer}
        pointerEvents="none"
      >
        <Animated.View style={{
          backgroundColor: colorOfHalo,
          width: Animated.multiply(2, this.state.gpsAccuracyRadius),
          height: Animated.multiply(2, this.state.gpsAccuracyRadius),
          borderRadius: this.state.gpsAccuracyRadius,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'absolute',
        }}
        />
        <View style={styles.container}>
          <View style={styles.markerHalo} />
          {!this.props.mapViewModeIsSwitching &&
            <View style={[styles.heading, { transform: [{ rotate }] }]}>
              <View style={styles.headingPointer} />
            </View>
          }
          {this.props.microDateEnabled &&
            <View style={[styles.heading, { transform: [{ rotate: rotateTarget }] }]}>
              <View style={[styles.headingPointer, {
                borderBottomColor: markerColor,
              }]}
              />
            </View>
          }
          <View style={[styles.marker, {
              backgroundColor: markerColor,
            }]}
          />
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
    zIndex: 1,
  },
  // The container is necessary to protect the markerHalo shadow from clipping
  container: {
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
