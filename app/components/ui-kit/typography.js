import React from 'react';
import { Text } from 'react-native';

import TextWithLetterSpacing from './text-with-letter-spacing';

export const H1 = (props) => (
  <Text style={{ ...props.style, ...styles.h1 }} allowFontScaling={false}>
    {props.children}
  </Text>
);

export const H2 = (props) => (
  <Text style={{ ...props.style, ...styles.h2 }} allowFontScaling={false}>
    {props.children}
  </Text>
);

export const H3 = (props) => {
  const styleH3 = {
    fontFamily: props.buttonText ? 'OpenSans-SemiBold' : 'OpenSans-Bold',
    color: props.color ? props.color : '#000000',
    lineHeight: 20,
    fontSize: 16,
    textAlign: props.align ? props.align : 'left',
  };

  return (
    <Text style={{ ...props.style, ...styleH3 }} allowFontScaling={false}>
      {props.children}
    </Text>
  );
};

export const Body = (props) => {
  const styleBody = {
    fontFamily: 'OpenSans-Regular',
    color: props.color ? props.color : '#000000',
    lineHeight: 20,
    fontSize: 16,
    textAlign: 'left',
  };

  return (
    <Text style={{ ...props.style, ...styleBody }} allowFontScaling={false}>
      {props.children}
    </Text>
  );
};

export const Caption1 = (props) => (
  <TextWithLetterSpacing spacing={1.2} textStyle={{ ...props.style, ...styles.caption1 }}>
    {props.children.toUpperCase()}
  </TextWithLetterSpacing>
);

export const Caption2 = (props) => (
  <Text style={{ ...props.style, ...styles.caption2 }} allowFontScaling={false}>
    {props.children}
  </Text>
);

const styles = {
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
};
