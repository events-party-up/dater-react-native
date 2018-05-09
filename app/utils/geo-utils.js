import { GeoCoordinates } from '../types';

const GeoUtils = {
  distance,
  boundingBoxCoordinates,
  getBearing,
  getBearing2,
  wrapCompassHeading,
  toRad,
  toDeg,
  destinationPoint,
};

/**
 * Calculates the distance, in meters, between two locations, via the
 * Haversine formula. Note that this is approximate due to the fact that
 * the Earth's radius varies between 6356.752 km and 6378.137 km.
 *
 * @param {Object} location1 The first location given as .latitude and .longitude
 * @param {Object} location2 The second location given as .latitude and .longitude
 * @return {number} The distance, in meters, between the locations.
 */
function distance(location1: GeoCoordinates, location2: GeoCoordinates) {
  // const radius = 6371; // Earth's radius in kilometers
  // const latDelta = degreesToRadians(location2.latitude - location1.latitude);
  // const lonDelta = degreesToRadians(location2.longitude - location1.longitude);

  // const a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
  //   (Math.cos(degreesToRadians(location1.latitude)) *
  //     Math.cos(degreesToRadians(location2.latitude)) *
  //     Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));

  // const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  // const distanceKm = radius * c;
  // const distanceM = distanceKm * 1000;
  // return distanceM;

  const R = 6371e3; // earth radius in metres
  const φ1 = toRad(location1.latitude);
  const φ2 = toRad(location2.latitude);
  const Δφ = toRad(location2.latitude - location1.latitude);
  const Δλ = toRad(location2.longitude - location1.longitude);

  const a = (Math.sin(Δφ / 2) * Math.sin(Δφ / 2)) +
    (Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) * Math.sin(Δλ / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const dist = R * c;
  return dist;
}

/**
 * Calculates the SW and NE corners of a bounding box around a center point for a given radius;
 *
 * @param {Object} center The center given as .latitude and .longitude
 * @param {number} radius The radius of the box (in kilometers)
 * @return {Object} The SW and NE corners given as .swCorner and .neCorner
 */
function boundingBoxCoordinates(center, radius) {
  const KM_PER_DEGREE_LATITUDE = 110.574;
  const latDegrees = radius / KM_PER_DEGREE_LATITUDE;
  const latitudeNorth = Math.min(90, center.latitude + latDegrees);
  const latitudeSouth = Math.max(-90, center.latitude - latDegrees);
  // calculate longitude based on current latitude
  const longDegsNorth = metersToLongitudeDegrees(radius, latitudeNorth);
  const longDegsSouth = metersToLongitudeDegrees(radius, latitudeSouth);
  const longDegs = Math.max(longDegsNorth, longDegsSouth);
  return {
    swCorner: { // bottom-left (SW corner)
      latitude: latitudeSouth,
      longitude: wrapLongitude(center.longitude - longDegs),
    },
    neCorner: { // top-right (NE corner)
      latitude: latitudeNorth,
      longitude: wrapLongitude(center.longitude + longDegs),
    },
  };
}

/**
 * Calculates the number of degrees a given distance is at a given latitude.
 *
 * @param {number} distance The distance to convert.
 * @param {number} latitude The latitude at which to calculate.
 * @return {number} The number of degrees the distance corresponds to.
 */
function metersToLongitudeDegrees(distance1, latitude) {
  const EARTH_EQ_RADIUS = 6378137.0;
  // this is a super, fancy magic number that the GeoFire lib can explain (maybe)
  const E2 = 0.00669447819799;
  const EPSILON = 1e-12;
  const radians = toRad(latitude);
  const num = (Math.cos(radians) * EARTH_EQ_RADIUS * Math.PI) / 180;
  const denom = 1 / Math.sqrt(1 - (E2 * Math.sin(radians) * Math.sin(radians)));
  const deltaDeg = num * denom;
  if (deltaDeg < EPSILON) {
    return distance1 > 0 ? 360 : 0;
  }
  // else
  return Math.min(360, distance1 / deltaDeg);
}

/**
 * Wraps the longitude to [-180,180].
 *
 * @param {number} longitude The longitude to wrap.
 * @return {number} longitude The resulting longitude.
 */
function wrapLongitude(longitude) {
  if (longitude <= 180 && longitude >= -180) {
    return longitude;
  }
  const adjusted = longitude + 180;
  if (adjusted > 0) {
    return (adjusted % 360) - 180;
  }
  // else
  return 180 - (-adjusted % 360);
}

function toRad(degrees) {
  return (degrees * Math.PI) / 180;
}

function toDeg(rad) {
  return (rad * 180) / Math.PI;
}

/**
 * Calculate the bearing between two positions as a value from 0-360
 *
 * @param lat1 - The latitude of the first position
 * @param lng1 - The longitude of the first position
 * @param lat2 - The latitude of the second position
 * @param lng2 - The longitude of the second position
 *
 * @return int - The bearing between 0 and 360
 */
function getBearing(previousPosition: GeoCoordinates, currentPosition: GeoCoordinates) {
  const dLon = toRad(currentPosition.longitude - previousPosition.longitude);
  const y = Math.sin(dLon) * Math.cos(toRad(currentPosition.latitude));
  const x = (Math.cos(toRad(previousPosition.latitude)) * Math.sin(toRad(currentPosition.latitude))) -
    (Math.sin(toRad(previousPosition.latitude)) * Math.cos(toRad(currentPosition.latitude)) * Math.cos(dLon));
  const brng = toDeg(Math.atan2(y, x));
  return 360 - ((brng + 360) % 360);
}

function getBearing2(previousPosition: GeoCoordinates, currentPosition: GeoCoordinates) {
  const φ1 = toRad(previousPosition.latitude);
  const φ2 = toRad(currentPosition.latitude);
  const λ1 = toRad(previousPosition.longitude);
  const λ2 = toRad(currentPosition.longitude);

  const y = Math.sin(λ2 - λ1) * Math.cos(φ2);
  const x = (Math.cos(φ1) * Math.sin(φ2)) -
    (Math.sin(φ1) * Math.cos(φ2) * Math.cos(λ2 - λ1));
  const bearing = toDeg(Math.atan2(y, x));
  return bearing;
  // return (bearing + 360) % 360;
}

function wrapCompassHeading(heading) {
  if (heading > 180) {
    return -(360 - heading);
  }
  return heading;
}

function destinationPoint(position: GeoCoordinates, dst, bearing) {
  const radius = 6371e3;

  // sinφ2 = sinφ1⋅cosδ + cosφ1⋅sinδ⋅cosθ
  // tanΔλ = sinθ⋅sinδ⋅cosφ1 / cosδ−sinφ1⋅sinφ2
  // see mathforum.org/library/drmath/view/52049.html for derivation

  const δ = Number(dst) / radius; // angular distance in radians
  const θ = toRad(Number(bearing));

  const φ1 = toRad(position.latitude);
  const λ1 = toRad(position.longitude);

  const sinφ1 = Math.sin(φ1);
  const cosφ1 = Math.cos(φ1);
  const sinδ = Math.sin(δ);
  const cosδ = Math.cos(δ);
  const sinθ = Math.sin(θ);
  const cosθ = Math.cos(θ);

  const sinφ2 = (sinφ1 * cosδ) + (cosφ1 * sinδ * cosθ);
  const φ2 = Math.asin(sinφ2);
  const y = sinθ * sinδ * cosφ1;
  const x = cosδ - (sinφ1 * sinφ2);
  const λ2 = λ1 + Math.atan2(y, x);

  return {
    latitude: toDeg(φ2),
    longitude: ((toDeg(λ2) + 540) % 360) - 180,
  };
}


export default GeoUtils;
