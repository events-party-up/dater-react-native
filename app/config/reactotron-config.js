import Reactotron, {
  trackGlobalErrors,
  openInEditor,
  overlay,
  asyncStorage,
  networking,
} from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';
import sagaPlugin from 'reactotron-redux-saga';

import { Platform } from 'react-native';

Reactotron.clear();

Reactotron
  .configure({
    name: `Dater React Native (${Platform.OS})`,
  })
  .use(reactotronRedux({
    except: ['EFFECT_TRIGGERED', 'EFFECT_RESOLVED', 'EFFECT_REJECTED'],
  }))
  .use(sagaPlugin())
  .use(trackGlobalErrors())
  .use(openInEditor())
  .use(overlay())
  .use(asyncStorage())
  .use(networking())
  .connect();

console.tron = Reactotron;
Reactotron.clear();
