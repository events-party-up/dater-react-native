import firebase from 'react-native-firebase';

export function deleteFirestoreDoc({
  collection,
  doc,
}) {
  return firebase.firestore().collection(collection).doc(doc).delete();
}

export async function getFirestoreDocData({
  collection,
  doc,
}) {
  const docSnapshot = await firebase.firestore().collection(collection).doc(doc).get();
  return docSnapshot.data();
}
