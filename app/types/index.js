
// import firebase from 'react-native-firebase';

export type GeoCoordinates = {
  accuracy: number,
  altitude: number,
  heading: number,
  speed: number,
  latitude: number,
  longitude: number,
};

export type GeoCompass = {
  heading: number,
  enabled: boolean,
  error: string,
};

export type LngLat = [
  number, number
];

export type MicroDate = {
  id: string,
  acceptTS: Date,
  finishTS: Date,
  active: boolean,
  requestBy: string,
  requestFor: string,
  requestByRef: string,
  requestForRef: string,
  requestByGeoPoint: FireStoreGeoPoint,
  requestForGeoPoint: FireStoreGeoPoint,
  selfieGeoPoint: FireStoreGeoPoint,
}

export type FireStoreGeoPoint = {
  // ...firebase.firestore.GeoPoint,
  latitude: number,
  longitude: number,
}
