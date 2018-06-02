import * as React from 'react';
import { StyleSheet } from 'react-native';

import { Caption1, Body } from '../../../components/ui-kit/typography';

type Props = {
  children: any,
  header: string,
  style: typeof StyleSheet,
};

export default class CardInfoItemMolecule extends React.Component<Props> {
  render() {
    return (
      <React.Fragment>
        <Caption1
          style={[this.props.style, styles.infoItemHeader]}
        >
          {this.props.header}
        </Caption1>
        <Body
          style={[this.props.style, styles.infoItemBody]}
        >
          {this.props.children}
        </Body>
      </React.Fragment>
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
});
