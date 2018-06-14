import * as React from 'react';
import { StyleSheet, View } from 'react-native';

import { Caption1, Body } from '../../../components/ui-kit/atoms/typography';

type Props = {
  children: any,
  header: string,
  style: typeof StyleSheet,
  captionStyle: typeof StyleSheet,
  bodyStyle: typeof StyleSheet,
};

export default class CardInfoItemMolecule extends React.Component<Props> {
  render() {
    return (
      <View
        style={[styles.container, this.props.style]}
      >
        <Caption1
          style={[styles.infoItemHeader, this.props.captionStyle]}
        >
          {this.props.header}
        </Caption1>
        <Body
          style={[styles.infoItemBody, this.props.bodyStyle]}
        >
          {this.props.children}
        </Body>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  infoItemHeader: {
    marginTop: 8,
    marginBottom: 4,
  },
  infoItemBody: {
    marginBottom: 8,
  },
  container: {
    flexDirection: 'column',
  },
});
