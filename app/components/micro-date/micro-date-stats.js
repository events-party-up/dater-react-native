import * as React from 'react';
import firebase from 'react-native-firebase';
import { StyleSheet } from 'react-native';

import { MICRO_DATES_COLLECTION } from '../../constants';
import { Caption2 } from '../ui-kit/atoms/typography';

type Props = {
  microDateId: string,
  uid: string,
  style: typeof StyleSheet,
};

type State = {
  score: number,
}

class MicroDateStats extends React.Component<Props, State> {
  queryUnsubscribe;

  constructor(props: any) {
    super(props);
    this.state = {
      score: 0,
    };
  }

  componentWillMount() {
    // console.log(`MicroDateStats mounted for date id ${this.props.microDateId} user ${this.props.uid}`);
    const statsQuery = firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(this.props.microDateId)
      .collection('stats')
      .doc(this.props.uid.substring(0, 8));

    this.queryUnsubscribe = statsQuery.onSnapshot(this.onStatsChanged, this.onError);
  }

  onStatsChanged = (snapshot) => {
    const newStats = snapshot.data();
    // console.log('MicroDateStats stats changed: ', newStats);
    this.setState(newStats);
  };

  onError = (error) => {
    console.warn('Error in MicroDateStats: ', error);
  }

  componentWillUnmount() {
    if (this.queryUnsubscribe) {
      this.queryUnsubscribe();
    }
  }

  render() {
    return (
      <Caption2 style={this.props.style}>
        {Math.floor(this.state.score)}
      </Caption2>
    );
  }
}

export default MicroDateStats;
