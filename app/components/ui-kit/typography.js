import React from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

export const H1 = (props) => (
  <Text style={styles.headerOne}>
    {props.children}
  </Text>
);

export const H2 = (props) => (
  <Text style={styles.headerTwo}>
    {props.children}
  </Text>
);

const styles = StyleSheet.create({
  headerOne: {
    fontFamily: 'Open Sans',
    color: '#000000',
    lineHeight: 40,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  headerTwo: {
    fontFamily: 'Open Sans',
    color: '#000000',
    lineHeight: 24,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
  },
});
