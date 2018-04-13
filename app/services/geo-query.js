import firebase from 'react-native-firebase';
import { usersAroundActionCreators } from '../redux';
import GeoUtils from '../utils';

const ONE_HOUR = 1000 * 60 * 60;
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
const listenForUsersAround = (area, dispatch) => {
  // calculate the SW and NE corners of the bounding box to query for
  const { currentUser } = firebase.auth();
  const box = GeoUtils.boundingBoxCoordinates(area.center, area.radius);
  const lesserGeopoint = new firebase.firestore
    .GeoPoint(box.swCorner.latitude, box.swCorner.longitude);
  const greaterGeopoint = new firebase.firestore
    .GeoPoint(box.neCorner.latitude, box.neCorner.longitude);
  // construct the Firestore query
  const query = firebase.firestore().collection(collectionPath)
    .where(geoPointPath, '>', lesserGeopoint)
    .where(geoPointPath, '<', greaterGeopoint);
  const unsubscribe = query.onSnapshot((snapshot) => {
    const usersAround = []; // used to hold all the loc data
    snapshot.forEach((userSnapshot) => {
      const userData = userSnapshot.data();
      userData.uid = userSnapshot.id;

      if (currentUser && userData.uid === currentUser.uid) {
        return;
      } else if (Date.now() - new Date(userData.timestamp) > ONE_HOUR * 12) {
        // only show users with fresh timestamps
        return;
      } else if (!userData.visible) {
        return;
      }

      userData.shortId = userSnapshot.id.substring(0, 4);
      userData.distance = GeoUtils.distance(area.center, userData[geoPointPath]);
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

export default listenForUsersAround;
