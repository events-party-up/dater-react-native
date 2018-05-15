import React from 'react';
import {
  StyleSheet,
  View,
  TouchableOpacity,
} from 'react-native';

import { H3 } from '../ui-kit/typography';

type Props = {
  title: string,
  onPress: () => void,
};

class UserOnMapMarker extends React.Component<Props> {
  render() {
    const { title } = this.props;
    return (
      <TouchableOpacity
        style={styles.container}
        onPress={this.props.onPress}
      >
        <View style={styles.outerCircle}>
          <View style={styles.innerCircle}>
            <H3 style={styles.title}>{title}</H3>
          </View>
        </View>
        <View style={styles.arrowBorder} />
        <View style={styles.arrow} />
      </TouchableOpacity>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    // zIndex: 1,
  },
  title: {
    color: '#fff',
    alignSelf: 'center',
    textAlign: 'center',
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
  outerCircle: {
    elevation: 1,
    backgroundColor: '#fff',
    width: 32,
    height: 32,
    borderRadius: 32 / 2,
    alignItems: 'center',
    justifyContent: 'center',
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

});

export default UserOnMapMarker;
