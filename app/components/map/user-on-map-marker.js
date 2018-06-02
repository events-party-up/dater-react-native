import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';

import { H3 } from '../ui-kit/typography';
import cloudinaryUrl from '../../utils/cloudinary-utils';
import { CloudinaryPhoto } from '../../types';

const ARROW_SIZE = 7;
const ARROW_DISTANCE = 10;
const HALO_SIZE: number = 32;
const HEADING_BOX_SIZE = HALO_SIZE + ARROW_SIZE + ARROW_DISTANCE;

type Props = {
  title: string,
  onPress: () => void,
  heading: number,
  mapViewBearingAngle: number,
  photo: CloudinaryPhoto,
};

class UserOnMapMarker extends React.Component<Props> {
  render() {
    const { title } = this.props;
    const rotation = this.props.heading - this.props.mapViewBearingAngle;
    const rotate = `${rotation}deg`;

    return (
      <TouchableOpacity
        onPress={this.props.onPress}
      >
        <View style={styles.container}>
          <View style={styles.outerCircle}>
            {this.props.photo &&
              <Image
                style={styles.innerCircle}
                source={{
                    uri: cloudinaryUrl({
                      publicId: this.props.photo.public_id,
                      version: this.props.photo.version,
                    }, {
                        height: 26,
                        width: 26,
                        crop: 'fill',
                        gravity: 'faces',
                      }),
                  }}
              />
            }
            {this.props.title &&
              <View style={styles.innerCircle}>
                <H3 style={styles.title}>{title}</H3>
              </View>
            }
          </View>
          <View style={styles.circlePin}>
            <View style={styles.arrowBorder} />
            <View style={styles.arrow} />
          </View>
          {this.props.heading > 0 &&
            <View style={[styles.heading, { transform: [{ rotate }] }]}>
              <View style={styles.headingPointer} />
            </View>
          }
          {/* <View style={[styles.heading, { transform: [{ rotate: '0deg' }] }]}>
            <View style={styles.headingPointer} />
          </View>
          <View style={[styles.heading, { transform: [{ rotate: '90deg' }] }]}>
            <View style={styles.headingPointer} />
          </View>
          <View style={[styles.heading, { transform: [{ rotate: '180deg' }] }]}>
            <View style={styles.headingPointer} />
          </View>
          <View style={[styles.heading, { transform: [{ rotate: '270deg' }] }]}>
            <View style={styles.headingPointer} />
          </View> */}
        </View>
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    width: HEADING_BOX_SIZE,
    height: HEADING_BOX_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
  },
  title: {
    color: '#fff',
    alignSelf: 'center',
    textAlign: 'center',
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
    borderBottomColor: '#2c7cf6',
    borderLeftColor: 'transparent',
  },
  outerCircle: {
    elevation: 1,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    alignItems: 'center',
    justifyContent: 'center',
    alignContent: 'center',
    alignSelf: 'center',
    shadowColor: '#4F4F4F',
    shadowOpacity: 0.5,
    shadowRadius: 4,
    shadowOffset: {
      width: 0, height: 4,
    },
  },
  innerCircle: {
    backgroundColor: 'gray',
    width: 26,
    height: 26,
    borderRadius: 26 / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  circlePin: {
    position: 'absolute',
    bottom: -7,
    left: 0,
    right: 0,
  },
  arrow: {
    backgroundColor: 'transparent',
    borderWidth: 9,
    borderColor: 'transparent',
    borderTopColor: '#fff',
    alignSelf: 'center',
    marginTop: -10,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderWidth: 3.7,
    borderColor: 'transparent',
    borderTopColor: 'rgba(0, 0, 0, 0.11)',
    alignSelf: 'center',
    marginTop: -0.5,
  },
});

export default UserOnMapMarker;
