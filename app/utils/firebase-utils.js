import firebase from 'react-native-firebase';

export function setFirestore({
  collection,
  doc,
  data,
  args,
}) {
  return firebase.firestore().collection(collection).doc(doc).set(data, args);
}

export function updateFirestore({
  collection,
  doc,
  data,
}) {
  return firebase.firestore().collection(collection).doc(doc).update(data);
}

export function deleteFirestoreDoc({
  collection,
  doc,
}) {
  return firebase.firestore().collection(collection).doc(doc).delete();
}
