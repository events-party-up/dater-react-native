import { takeEvery, call, put, take, cancel, select } from 'redux-saga/effects';
import firebase from 'react-native-firebase';
import { eventChannel } from 'redux-saga';

import {
  MICRO_DATES_COLLECTION,
  PROFILE_PHOTOS_STORAGE_PATH,
} from '../../constants';

// TODO: watch for Cloud function to finish its task and fire proper actions / update reducers
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
          yield* uploadMicroDateSelfieSaga(uploadStartAction);
          break;
        case 'profilePhoto':
          yield* uploadProfilePhotoSaga(uploadStartAction);
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
    const microDate = yield select((state) => state.microDate);
    const myCoords = yield select((state) => state.location.coords);
    const uploadTask = firebase.storage()
      .ref(`${MICRO_DATES_COLLECTION}/${microDate.id}/${uid}/${fileName}`)
      .put(uploadStartAction.payload.uri, metadata);
    const uploadTaskChannel = yield call(createUploadTaskChannel, uploadTask);
    const progressTask = yield takeEvery(uploadTaskChannel, uploadTaskProgress);
    yield take('UPLOAD_PHOTO_SUCCESS');
    yield yield firebase.firestore()
      .collection(MICRO_DATES_COLLECTION)
      .doc(microDate.id)
      .update({
        selfieGeoPoint: new firebase.firestore.GeoPoint(myCoords.latitude, myCoords.longitude),
      });

    yield uploadTaskChannel.close();
    yield cancel(progressTask);
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
    const uploadTask = firebase.storage()
      .ref(`${PROFILE_PHOTOS_STORAGE_PATH}/${uid}/${fileName}`)
      .put(uploadStartAction.payload.uri, metadata);
    const uploadTaskChannel = yield call(createUploadTaskChannel, uploadTask);
    const progressTask = yield takeEvery(uploadTaskChannel, uploadTaskProgress);
    yield take('UPLOAD_PHOTO_SUCCESS');
    yield uploadTaskChannel.close();
    yield cancel(progressTask);
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

