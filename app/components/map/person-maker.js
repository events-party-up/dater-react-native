import React from 'react';

import {
  StyleSheet,
  View,
  Text,
} from 'react-native';

type Props = {
  title: string,
};

class PersonMaker extends React.Component<Props> {
  render() {
    const { title } = this.props;
    return (
      <View style={styles.container}>
        <View style={styles.bubble}>
          <Text style={styles.title}>{title}</Text>
        </View>
        <View style={styles.arrowBorder} />
        <View style={styles.arrow} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'column',
    alignSelf: 'flex-start',
    zIndex: 1,
  },
  bubble: {
    flex: 0,
    flexDirection: 'row',
    alignSelf: 'flex-start',
    backgroundColor: '#228b22',
    padding: 2,
    borderRadius: 3,
    borderColor: '#006400',
    borderWidth: 0.5,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  arrow: {
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#228b22',
    alignSelf: 'center',
    marginTop: -9,
  },
  arrowBorder: {
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: 'transparent',
    borderTopColor: '#006400',
    alignSelf: 'center',
    marginTop: -0.5,
  },
});

export default PersonMaker;
