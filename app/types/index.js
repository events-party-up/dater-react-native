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
  selfie: PhotoSelfie,
  startDistance: number,
  moderationStatus: MicroDateModerationStatus,
  status: MicroDateStatus,
}

export type MicroDateModerationStatus = 'PENDING' | 'DECLINED' | 'APPROVED';
export type MicroDateStatus = 'REQUEST' | 'ACCEPT' | 'CANCEL_REQUEST' | 'STOP' | 'SELFIE_UPLOADED' | 'FINISHED';

export type FireStoreGeoPoint = {
  // ...firebase.firestore.GeoPoint,
  latitude: number,
  longitude: number,
}

export type PhotoSelfie = {
  publicId: string, // cloudinary Public Id
  cloudinaryUrl: string,
  width: number,
  height: number,
  version: number, // version of file in Cloudinary
  format: string,
  timestamp: Date,
  uploadedBy: string,
  storageUrl: string, // url in Firebase Storage
};

export type CloudinaryPhoto = {
  public_id: string,
  version: number,
}

export type PublicUserGeoPoint = {
  visibility: 'public' | 'private' | [string],
  accuracy: number,
  selfieGeoPoint: FireStoreGeoPoint,
  heading: number,
  speed: number,
  timestamp: Date,
}

export type PrivateUserRecord = {
  gender: 'male' | 'female',
  name: string,
  uid: string,
  birthday: Date,
  mainPhoto: PhotoSelfie,
  phoneNumber: string,
}

export type PhotoType = 'microDateSelfie' | 'profilePhoto';

