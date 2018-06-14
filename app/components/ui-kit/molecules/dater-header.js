import * as React from 'react';

import {
  StyleSheet,
  View,
} from 'react-native';

import { H2 } from '../../../components/ui-kit/atoms/typography';

type Props = {
  children: React.Node,
};

export default class DaterHeader extends React.Component<Props> {
  render() {
    return (
      <View style={styles.header}>
        <H2 style={{ textAlign: 'left' }}>{this.props.children}</H2>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  header: {
    paddingBottom: 16,
    paddingTop: 8,
    paddingLeft: 16,
  },
});
