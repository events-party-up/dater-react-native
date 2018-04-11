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
  <Text style={{ ...props.style, ...styleH2 }}>
    {props.children}
  </Text>
);

export const H3 = (props) => {
  const style = StyleSheet.create({
    h3: {
      fontFamily: props.buttonText ? 'OpenSans-SemiBold' : 'OpenSans-Bold',
      color: props.color ? props.color : '#000000',
      lineHeight: 20,
      fontSize: 16,
      textAlign: props.align ? props.align : 'left',
    },
  });
  return (
    <Text style={style.h3}>
      {props.children}
    </Text>
  );
};

export const Body = (props) => {
  const styles = StyleSheet.create({
    body: {
      fontFamily: 'OpenSans-Regular',
      color: props.color ? props.color : '#000000',
      lineHeight: 20,
      fontSize: 16,
      textAlign: 'left',
    },
  });

  return (
    <Text style={styles.body}>
      {props.children}
    </Text>
  );
};

export const Caption1 = (props) => (
  <TextWithLetterSpacing spacing={1.2} textStyle={styles.caption1}>
    {props.children.toUpperCase()}
  </TextWithLetterSpacing>
);

export const Caption2 = (props) => (
  <Text style={styles.caption2}>
    {props.children}
  </Text>
);

const styleH2 = {
  fontFamily: 'OpenSans-Bold',
  color: '#000000',
  lineHeight: 24,
  fontSize: 22,
  textAlign: 'left',
};

const styles = StyleSheet.create({
  h1: {
    fontFamily: 'OpenSans-Bold',
    color: '#000000',
    lineHeight: 40,
    fontSize: 32,
    textAlign: 'left',
  },
  h2: {
    fontFamily: 'OpenSans-Bold',
    color: '#000000',
    lineHeight: 24,
    fontSize: 22,
    textAlign: 'left',
  },
  h3: {
    fontFamily: 'OpenSans-Bold',
    color: '#000000',
    lineHeight: 20,
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  body: {
    fontFamily: 'OpenSans-Regular',
    color: '#000000',
    lineHeight: 20,
    fontSize: 16,
    textAlign: 'left',
  },
  caption1: {
    fontFamily: 'OpenSans-Regular',
    color: 'rgba(0, 0, 0, 0.3)',
    lineHeight: 16,
    fontSize: 12,
    textAlign: 'left',
  },
  caption2: {
    fontFamily: 'OpenSans-Regular',
    color: 'rgba(0, 0, 0, 0.4)',
    lineHeight: 16,
    fontSize: 12,
    textAlign: 'left',
  },
});
