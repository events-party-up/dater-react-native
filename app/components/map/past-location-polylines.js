import * as React from 'react';
import { Polyline } from 'react-native-maps';

import { GeoCoordinates } from '../../types';

type Props = {
  pastCoords: Array<GeoCoordinates>,
  uid: string;
  mode: 'target' | 'own',
};

class PastLocationPolylines extends React.Component<Props> {
  renderPastLocationsPolylines() {
    const totalPastCoords = this.props.pastCoords.length;
    return this.props.pastCoords.map((endingPoint, index) => {
      if (index < 1) return null; // cannot build polylines from one point
      // if (index >= totalPastCoords - 1) return null; // do not show marker for the last point
      const startingPoint = this.props.pastCoords[index - 1];
      const strokeColorOpacity = 1 - ((totalPastCoords - index) / totalPastCoords);
      const strokeColor = this.props.mode ===
        'own' ? `rgba(128, 128, 128, ${strokeColorOpacity})` : `rgba(0, 128, 0, ${strokeColorOpacity})`;
      return (
        <Polyline
          key={`polyline-${this.props.uid}-${startingPoint.latitude}-${startingPoint.longitude}-${endingPoint.latitude}-${endingPoint.longitude}`} // eslint-disable-line
          strokeWidth={3}
          strokeColor={strokeColor}
          lineJoin="round"
          coordinates={[startingPoint, endingPoint]}
        />
      );
    });
  }

  render() {
    return (
      <React.Fragment>
        {this.renderPastLocationsPolylines()}
      </React.Fragment>
    );
  }
}

export default PastLocationPolylines;
