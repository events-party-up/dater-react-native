import { all } from 'redux-saga/effects';
import compassSaga from './compass/compass-saga';
import mapViewSaga from './map-view/mapview-saga';
import mapViewInitializeRegionSaga from './map-view/mapview-init-region-saga';
import mapViewMyVisibilitySaga from './map-view/mapview-my-visibility-saga';
import locationSaga from './location/location-saga';
import authSaga from './auth/auth-saga';
import authPhoneSaga from './auth/auth-phone-saga';
import mapPanelSaga from './map-panel/map-panel-saga';
import usersAroundSaga from './users-around/users-around-saga';
import appStateSaga from './app-state/app-state-saga';
import microDateSaga from './micro-date/micro-date-saga';
import uploadPhotosSaga from './upload-photos/upload-photos-saga';
import currentUserSaga from './current-user/current-user-saga';
import hapticFeedbackSaga from './pure-sagas/haptic-feedback-saga';
import fcmPushSaga from './permissions/fcm-push-saga';
import gpsStateSaga from './app-state/gps-state-saga';
import networkStateSaga from './app-state/network-state-saga';
import systemNotificaitonsSaga from './system-notifications/system-notifications-saga';

export default function* rootSaga() {
  yield all([
    mapViewInitializeRegionSaga(),
    mapViewSaga(),
    mapViewMyVisibilitySaga(),
    authSaga(),
    authPhoneSaga(),
    compassSaga(),
    locationSaga(),
    mapPanelSaga(),
    usersAroundSaga(),
    appStateSaga(),
    gpsStateSaga(),
    microDateSaga(),
    uploadPhotosSaga(),
    currentUserSaga(),
    hapticFeedbackSaga(),
    fcmPushSaga(),
    networkStateSaga(),
    systemNotificaitonsSaga(),
  ]);
}
