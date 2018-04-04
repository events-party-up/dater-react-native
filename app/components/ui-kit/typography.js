import React from 'react';
import {
  StyleSheet,
  Text,
} from 'react-native';

import TextWithLetterSpacing from './text-with-letter-spacing';

export const H1 = (props) => (
  <Text style={styles.h1}>
    {props.children}
  </Text>
);

export const H2 = (props) => (
  <Text style={styles.h2}>
    {props.children}
  </Text>
);

export const H3 = (props) => (
  <Text style={styles.h3}>
    {props.children}
  </Text>
);

export const Body = (props) => (
  <Text style={styles.body}>
    {props.children}
  </Text>
);

export const Caption1 = (props) => (
  <TextWithLetterSpacing spacing={1.2} textStyle={styles.caption1}>
    {props.children}
  </TextWithLetterSpacing>
);

export const Caption2 = (props) => (
  <Text style={styles.caption2}>
    {props.children}
  </Text>
);

const styles = StyleSheet.create({
  h1: {
    fontFamily: 'Open Sans',
    color: '#000000',
    lineHeight: 40,
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  h2: {
    fontFamily: 'Open Sans',
    color: '#000000',
    lineHeight: 24,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  h3: {
    fontFamily: 'Open Sans',
    color: '#000000',
    lineHeight: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  body: {
    fontFamily: 'Open Sans',
    color: '#000000',
    lineHeight: 20,
    fontSize: 16,
    fontWeight: 'normal',
    textAlign: 'left',
  },
  caption1: {
    fontFamily: 'Open Sans',
    color: 'rgba(0, 0, 0, 0.3)',
    lineHeight: 16,
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'left',
  },
  caption2: {
    fontFamily: 'Open Sans',
    color: 'rgba(0, 0, 0, 0.4)',
    lineHeight: 16,
    fontSize: 12,
    fontWeight: 'normal',
    textAlign: 'left',
  },
});
