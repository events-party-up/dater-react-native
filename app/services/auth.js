import firebase from 'react-native-firebase';

export const signInAnonymously = async () => {
  return firebase.auth().signInAnonymouslyAndRetrieveData()
    .then((response) => {
      console.log(response);
      return {
        isNewUser: response.additionalUserInfo.isNewUser,
        isAnonymous: response.user.isAnonymous,
        uid: response.user.uid,
        creationTime: response.user.metadata.creationTime,
        lastSignInTime: response.user.metadata.lastSignInTime,
      }
    });
}