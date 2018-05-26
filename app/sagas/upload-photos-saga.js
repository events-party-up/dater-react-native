import { takeEvery } from 'redux-saga/effects';

export default function* uploadPhotosSaga() {
  yield takeEvery('UPLOAD_PHOTO_START', uploadPhoto);
}

function* uploadPhoto(action) {
  yield console.log('New photo: ', action);
}
