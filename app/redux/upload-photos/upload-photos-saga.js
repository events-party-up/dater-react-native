import { takeEvery, put, take, cancel, select, fork } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';
import RNFS from 'react-native-fs';
import { isEqual } from 'lodash';

import {
  MICRO_DATES_COLLECTION,
  PROFILE_PHOTOS_STORAGE_PATH,
  CURRENT_USER_COLLECTION,
} from '../../constants';

export default function* uploadPhotosSaga() {
  try {
    const isUserAuthenticated = yield select((state) => state.auth.isAuthenticated);
    if (!isUserAuthenticated) { // user must be authorized
      yield take('AUTH_SUCCESS');
    }

    while (true) {
      const uploadStartAction = yield take('UPLOAD_PHOTO_START');
      switch (uploadStartAction.payload.type) {
        case 'microDateSelfie':
          yield fork(uploadMicroDateSelfieSaga, uploadStartAction);
          break;
        case 'profilePhoto':
          yield fork(uploadProfilePhotoSaga, uploadStartAction);
          break;
        default:
          break;
      }
    }
  } catch (error) {
    yield put({ type: 'UPLOAD_PHOTO_ERROR', payload: error });
  }
}

function* uploadMicroDateSelfieSaga(uploadStartAction) {
  try {
    const uid = yield select((state) => state.auth.uid);
    const metadata = {
      contentType: 'image/jpeg',
    };
    const fileName = uploadStartAction.payload.uri.replace(/^.*[\\/]/, '');
    const fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1);
    const microDate = yield select((state) => state.microDate);
    const myCoords = yield select((state) => state.location.coords);

    const uploadTask = firebase.storage()
      .ref(`${MICRO_DATES_COLLECTION}/${microDate.id}/${uid}/selfie.${fileExtension}`)
      .put(uploadStartAction.payload.uri, metadata);
    const uploadTaskChannel = yield createUploadTaskChannel(uploadTask);
    const progressTask = yield takeEvery(uploadTaskChannel, uploadTaskProgress);
    yield take('UPLOAD_PHOTO_SUCCESS');
    yield uploadTaskChannel.close();
    yield cancel(progressTask);

    const postUploadChannel = yield createPostUploadChannel(MICRO_DATES_COLLECTION, microDate.id, 'selfie');
    yield take(postUploadChannel);
    yield RNFS.unlink(uploadStartAction.payload.uri);
    yield postUploadChannel.close();
    yield put({ type: 'UPLOAD_PHOTO_POST_UPLOAD_SUCCESS' });

    yield yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        selfieGeoPoint: new firebase.firestore.GeoPoint(myCoords.latitude, myCoords.longitude),
      });
  } catch (error) {
    yield put({ type: 'UPLOAD_PHOTO_MICRO_DATE_SELFIE_ERROR', payload: error });
  }
}

function* uploadProfilePhotoSaga(uploadStartAction) {
  try {
    const uid = yield select((state) => state.auth.uid);
    const metadata = {
      contentType: 'image/jpeg',
    };
    const fileName = uploadStartAction.payload.uri.replace(/^.*[\\/]/, '');
    const fileExtension = fileName.substr(fileName.lastIndexOf('.') + 1);

    const uploadTask = firebase.storage()
      .ref(`${PROFILE_PHOTOS_STORAGE_PATH}/${uid}/mainPhoto.${fileExtension}`)
      .put(uploadStartAction.payload.uri, metadata);
    const uploadTaskChannel = yield createUploadTaskChannel(uploadTask);
    const progressTask = yield takeEvery(uploadTaskChannel, uploadTaskProgress);
    yield take('UPLOAD_PHOTO_SUCCESS');
    yield uploadTaskChannel.close();
    yield cancel(progressTask);

    const postUploadChannel = yield createPostUploadChannel(CURRENT_USER_COLLECTION, uid, 'mainPhoto');
    yield take(postUploadChannel);
    yield RNFS.unlink(uploadStartAction.payload.uri);
    yield postUploadChannel.close();

    yield put({ type: 'UPLOAD_PHOTO_POST_UPLOAD_SUCCESS' });
  } catch (error) {
    yield put({ type: 'UPLOAD_PHOTO_PROFILE_ERROR', payload: error });
  }
}

function* uploadTaskProgress(progress) {
  if (progress.error) {
    yield put({ type: 'UPLOAD_PHOTO_PROGRESS_ERROR', payload: progress.error });
  } else if (progress.running === true) {
    yield put({
      type: 'UPLOAD_PHOTO_RUNNING',
      payload: {
        ...progress,
      },
    });
  } else if (progress.finished === true) {
    yield put({
      type: 'UPLOAD_PHOTO_SUCCESS',
      payload: {
        ...progress,
      },
    });
  }
}

function createUploadTaskChannel(uploadTask) {
  return eventChannel((emit) => {
    const onTaskProgress = (snapshot) => {
      // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
      const progress = Math.floor((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          emit({
            progress,
            paused: true,
          });
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          emit({
            progress,
            running: true,
          });
          break;
        default:
          emit({
            progress,
            state: snapshot.state,
          });
          break;
      }
    };

    const onTaskError = (error) => {
      emit({
        error: error.code,
      });
      // A full list of error codes is available at
      // https://firebase.google.com/docs/storage/web/handle-errors
      switch (error.code) {
        case 'storage/unauthorized':
          // User doesn't have permission to access the object
          break;

        case 'storage/canceled':
          // User canceled the upload
          break;
        case 'storage/unknown':
          // Unknown error occurred, inspect error.serverResponse
          break;
        default:
          break;
      }
    };

    const onTaskSuccess = async (finishedTask) => {
      // Upload completed successfully, now we can get the download URL
      emit({
        finished: true,
        progress: 100,
        downloadURL: finishedTask.downloadURL,
        metadata: finishedTask.metadata,
      });
    };

    // Listen for state changes, errors, and completion of the upload.
    uploadTask.on(
      firebase.storage.TaskEvent.STATE_CHANGED,
      onTaskProgress,
      onTaskError,
      onTaskSuccess,
    );

    const unsubscribe = async () => {
      // await uploadTask.ref.delete();
    };
    return unsubscribe;
  });
}

function createPostUploadChannel(collection, document, watchKey) {
  const query = firebase.firestore()
    .collection(collection)
    .doc(document);
  let firstSnapshot = true;
  let preUploadData;

  return eventChannel((emit) => {
    const onSnapshotUpdated = (dataSnapshot) => {
      if (firstSnapshot) { // emit results immediately if its first result of query
        firstSnapshot = false;
        preUploadData = dataSnapshot.data()[watchKey];
      } else if (!isEqual(preUploadData, dataSnapshot.data()[watchKey])) {
        emit(true);
      }
    };

    const onError = (error) => {
      emit({
        error,
      });
    };

    const unsubscribe = query.onSnapshot(onSnapshotUpdated, onError);

    return unsubscribe;
  });
}
