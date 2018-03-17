import firebase from 'react-native-firebase';
import { usersAroundActionCreators } from '../redux';

const collectionPath = 'geoPoints';
const geoPointPath = 'geoPoint';

/**
 * Get locations within a bounding box defined by a center point a
 * nd distance from from the center point to the side of the box;
 *
 * @param {Object} area an object that represents the bounding box
 *    around a point in which locations should be retrieved
 * @param {Object} area.center an object containing the latitude and
 *    longitude of the center point of the bounding box
 * @param {number} area.center.latitude the latitude of the center point
 * @param {number} area.center.longitude the longitude of the center point
 * @param {number} area.radius (in kilometers) the radius of a circle
 *    that is inscribed in the bounding box;
 *    This could also be described as half of the bounding box's side length.
 * @return {Promise} a Promise that fulfills with an array of all the
 *    retrieved locations
 */
export const listenForUsersAround = async (area, dispatch) => {
  // calculate the SW and NE corners of the bounding box to query for
  const box = boundingBoxCoordinates(area.center, area.radius);
  const lesserGeopoint = new firebase.firestore
    .GeoPoint(box.swCorner.latitude, box.swCorner.longitude);
  const greaterGeopoint = new firebase.firestore
    .GeoPoint(box.neCorner.latitude, box.neCorner.longitude);
  // construct the Firestore query
  const query = firebase.firestore().collection(collectionPath).where(geoPointPath, '>', lesserGeopoint).where(geoPointPath, '<', greaterGeopoint);
  const unsubscribe = query.onSnapshot((snapshot) => {
    const usersAround = []; // used to hold all the loc data
    snapshot.forEach((userSnapshot) => {
      const userData = userSnapshot.data();
      userData.id = userSnapshot.id;

      if (userData.id === firebase.auth().currentUser.uid) {
        return;
      }
      userData.shortId = userSnapshot.id.substring(0, 4);
      userData.distance = distance(area.center, userData[geoPointPath]);
      usersAround.push(userData);
    });
    dispatch(usersAroundActionCreators.updateUsersAround(usersAround));

    // snapshot.docChanges.forEach(function (change) {
    //   if (change.type === "added") {
    //     console.log("New locaiton: ", change.doc.data());
    //   }
    //   if (change.type === "modified") {
    //     console.log("Modified locaiton: ", change.doc.data());
    //   }
    //   if (change.type === "removed") {
    //     console.log("Removed location: ", change.doc.data());
    //   }
    // });
  });
  return unsubscribe;
};

/**
 * Calculates the distance, in meters, between two locations, via the
 * Haversine formula. Note that this is approximate due to the fact that
 * the Earth's radius varies between 6356.752 km and 6378.137 km.
 *
 * @param {Object} location1 The first location given as .latitude and .longitude
 * @param {Object} location2 The second location given as .latitude and .longitude
 * @return {number} The distance, in kilometers, between the inputted locations.
 */
export const distance = (location1, location2) => {
  const radius = 6371; // Earth's radius in kilometers
  const latDelta = degreesToRadians(location2.latitude - location1.latitude);
  const lonDelta = degreesToRadians(location2.longitude - location1.longitude);

  const a = (Math.sin(latDelta / 2) * Math.sin(latDelta / 2)) +
    (Math.cos(degreesToRadians(location1.latitude)) *
      Math.cos(degreesToRadians(location2.latitude)) *
      Math.sin(lonDelta / 2) * Math.sin(lonDelta / 2));

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceKm = radius * c;
  const distanceM = distanceKm * 1000;
  return Math.floor(distanceM);
};

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
  const radians = degreesToRadians(latitude);
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

function degreesToRadians(degrees) {
  return (degrees * Math.PI) / 180;
}
