import firebase from 'react-native-firebase';
import { authActionCreators } from '../redux'

export const signInAnonymously = (dispatch) => {
  return firebase.auth().signInAnonymouslyAndRetrieveData()
    .then((response) => {
      dispatch(authActionCreators.authSuccess({
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
      dispatch(authActionCreators.authSuccess({
        isAnonymous: user.isAnonymous,
        uid: user.uid,
        creationTime: user.metadata.creationTime,
        lastSignInTime: user.metadata.lastSignInTime,
      }));
    } else {
      console.log('Registering new user');
      signInAnonymously(dispatch);
    }
  });

  return unsubscribe;
}