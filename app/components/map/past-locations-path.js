import * as React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import firebase from 'react-native-firebase';
import {
  MICRO_DATES_COLLECTION,
  MAX_VISIBLE_PAST_LOCATIONS,
} from '../../constants';

import GeoUtils from '../../utils/geo-utils';

type Props = {
  mode: 'target' | 'own',
  microDateId: string,
  uid: string,
};

class PastLocationsPath extends React.Component<Props> {
  pathStyle = MapboxGL.StyleSheet.create({
    lines: {
      lineColor: this.props.mode ===
        'own' ? 'rgba(128, 128, 128, 1)' : 'rgba(0, 128, 0, 1)',
      lineWidth: 1.5,
      lineOpacity: 0.84,
      lineDasharray: [3, 3],
    },
    arrows: {
      fillAntialias: true,
      fillColor: this.props.mode === 'own' ? 'rgba(128, 128, 128, 1)' : 'rgba(0, 128, 0, 1)',
    },
  });


  queryUnsubscribe;
  pastLocations = [];

  componentWillMount() {
    console.log('PastLocationsPath mounted for id: ', this.props.microDateId);
    const pastLocationsQuery = firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(this.props.microDateId)
      .collection(`pastLocations_${this.props.uid.substring(0, 8)}`)
      .orderBy('serverTS', 'desc')
      .limit(MAX_VISIBLE_PAST_LOCATIONS);

    this.queryUnsubscribe = pastLocationsQuery.onSnapshot(this.onLocationsUpdated, this.onError);
  }

  onLocationsUpdated = (snapshot) => {
    if (snapshot.metadata.hasPendingWrites) { // do not process local updates triggered by local writes
      return;
    }

    snapshot.docChanges.forEach((change) => {
      if (change.type === 'added') {
        // console.log('New locaiton added: ', change.doc.data());
        this.pastLocations.unshift(change.doc.data());
      }
      if (change.type === 'modified') {
        // console.log('New locaiton modified: ', change.doc.data());
        this.pastLocations.push(change.doc.data());
      }
      if (this.pastLocations.length > MAX_VISIBLE_PAST_LOCATIONS) {
        this.pastLocations.shift();
      }
    });
  };

  onError = (error) => {
    console.warn('Error in PastLocationsPath: ', error);
  }

  componentWillUnmount() {
    if (this.queryUnsubscribe) {
      this.queryUnsubscribe();
    }
  }

  render() {
    if (this.pastLocations.length < 2) return null;

    const arrows = this.pastLocations.slice(1).map((coords, index) => {
      const { heading, distance } = coords;
      const arrowHeadLength = 7; // in meters
      let arrowTailLength = 7;
      arrowTailLength = arrowTailLength * 2 > distance ? distance : arrowTailLength * 2;
      const arrowSkirtLeft = GeoUtils.destinationPoint(coords.geoPoint, -arrowHeadLength, heading + 20);
      const arrowSkirtRight = GeoUtils.destinationPoint(coords.geoPoint, -arrowHeadLength, heading - 20);
      const arrowLineStartLeft = GeoUtils.destinationPoint(coords.geoPoint, -arrowHeadLength, heading + 4);
      const arrowLineStartRight = GeoUtils.destinationPoint(coords.geoPoint, -arrowHeadLength, heading - 4);
      const arrowLineEndLeft = GeoUtils.destinationPoint(coords.geoPoint, -arrowTailLength, heading + 1);
      const arrowLineEndRight = GeoUtils.destinationPoint(coords.geoPoint, -arrowTailLength, heading - 1);

      return {
        type: 'Feature',
        id: `arrow-${index}`,
        geometry: {
          type: 'Polygon',
          properties: {
            color: '#33C9EB', // blue
          },
          coordinates: [[
            // arrow tip
            [
              coords.geoPoint.longitude,
              coords.geoPoint.latitude,
            ],
            [
              arrowSkirtLeft.longitude,
              arrowSkirtLeft.latitude,
            ],
            [
              arrowLineStartLeft.longitude,
              arrowLineStartLeft.latitude,
            ],
            [
              arrowLineEndLeft.longitude,
              arrowLineEndLeft.latitude,
            ],
            [
              arrowLineEndRight.longitude,
              arrowLineEndRight.latitude,
            ],
            [
              arrowLineStartRight.longitude,
              arrowLineStartRight.latitude,
            ],
            [
              arrowSkirtRight.longitude,
              arrowSkirtRight.latitude,
            ],
            [
              coords.geoPoint.longitude,
              coords.geoPoint.latitude,
            ],
          ]],
        },
      };
    });

    const linesGeoJson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          properties: {
            color: '#F7455D', // red
          },
          geometry: {
            type: 'LineString',
            coordinates: this.pastLocations.map((coords) => [coords.geoPoint.longitude, coords.geoPoint.latitude]),
          },
        },
      ],
    };

    const arrowsGeoJson = {
      type: 'FeatureCollection',
      features: [...arrows],
    };

    return (
      <React.Fragment>
        <MapboxGL.ShapeSource
          id={`past-paths-arrows-shape-${this.props.mode}`}
          shape={arrowsGeoJson}
        >
          <MapboxGL.FillLayer
            id={`past-paths-arrows-layer-${this.props.mode}`}
            style={this.pathStyle.arrows}
            minZoomLevel={0}
            maxZoomLevel={20}
          />
        </MapboxGL.ShapeSource>
        <MapboxGL.ShapeSource
          id={`past-paths-lines-shape-${this.props.mode}`}
          shape={linesGeoJson}
        >
          <MapboxGL.LineLayer
            id={`past-paths-lines-layer--${this.props.mode}`}
            style={this.pathStyle.lines}
            belowLayerID={`past-paths-arrows-layer-${this.props.mode}`}
          />
        </MapboxGL.ShapeSource>
      </React.Fragment>
    );
  }
}

export default PastLocationsPath;
