import firebase from 'react-native-firebase';
import { authActionCreators } from '../redux'

export const signInAnonymously = async (dispatch) => {
  return firebase.auth().signInAnonymouslyAndRetrieveData()
    .then(async (response) => {
      await dispatch(authActionCreators.authNewRegistration({
        isNewUser: response.additionalUserInfo.isNewUser,
        isAnonymous: response.user.isAnonymous,
        uid: response.user.uid,
        creationTime: response.user.metadata.creationTime,
        lastSignInTime: response.user.metadata.lastSignInTime,
      }));
    });
}

export const initUserAuth = (dispatch) => {
  const unsubscribe = firebase.auth().onAuthStateChanged(user => {
    if (user) {
      console.log('User already exist');
      console.log(user);
      
      // await firebase.firestore().collection('users').doc(user.uid).set({
      //   registered: firebase.firestore.FieldValue.serverTimestamp(),
      // })

      dispatch(authActionCreators.authSuccess({
        isAnonymous: user.isAnonymous,
        uid: user.uid,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      }));
    } else {
      console.log('User is logged out, log in anonymously');
      signInAnonymously(dispatch);
    }
  });
  return unsubscribe;
}

export const signOutUser = async (dispatch) => {
  if (firebase.auth().currentUser.isAnonymous)
  {
    await firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).delete();
    await firebase.auth().currentUser.delete();
  } else {
    await firebase.auth().signOut();
  }
}