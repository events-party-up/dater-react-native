import * as React from 'react';

import {
  StyleSheet,
  View,
  Image,
} from 'react-native';

import { H2, Body } from '../../../components/ui-kit/atoms/typography';

type Props = {
  icon: Image,
  header: string,
  subheader: string,
  style: typeof StyleSheet,
};

export default class IconTitleSubtitleMolecule extends React.Component<Props> {
  render() {
    return (
      <View style={[styles.container, this.props.style]}>
        <Image
          source={this.props.icon}
          style={styles.topImage}
        />
        <H2 style={styles.header}>{this.props.header}</H2>
        <Body style={styles.subHeader}>{this.props.subheader}</Body>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
  },
  topImage: {
    alignSelf: 'center',
    marginTop: 128,
    marginBottom: 16,
  },
  header: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subHeader: {
    textAlign: 'center',
    marginBottom: 8,
  },
});
