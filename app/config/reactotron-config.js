import Reactotron, {
  trackGlobalErrors,
  openInEditor,
  overlay,
  asyncStorage,
  networking,
} from 'reactotron-react-native';
import { reactotronRedux } from 'reactotron-redux';

import { Platform } from 'react-native';

Reactotron
  .configure({
    name: `Dater React Native (${Platform.OS})`,
  })
  // .use(reactotronRedux())
  .use(trackGlobalErrors())
  .use(openInEditor())
  .use(overlay())
  .use(asyncStorage())
  .use(networking())
  .connect();

