import ReactNativeHeading from '@zsajjad/react-native-heading';
import { NativeEventEmitter } from 'react-native';

import { geoActionCreators } from '../redux/index';

const HEADING_UPDATE_ON_DEGREE_CHANGED = 10;

const start = async (dispatch) => {
  const listener = new NativeEventEmitter(ReactNativeHeading);
  const didStart = await ReactNativeHeading.start(HEADING_UPDATE_ON_DEGREE_CHANGED);
  if (didStart) {
    listener.addListener('headingUpdated', (heading) => {
      dispatch(geoActionCreators.updateCompassHeading(heading));
    });
  }
};

const stop = (listener) => {
  ReactNativeHeading.stop();
  listener.removeAllListeners('headingUpdated');
};

const CompassHeading = {
  start,
  stop,
};

export default CompassHeading;
