
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
