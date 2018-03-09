import Reactotron, {
  trackGlobalErrors,
  openInEditor,
  overlay,
  asyncStorage,
  networking
} from 'reactotron-react-native'
import {
  Platform,
} from 'react-native';

Reactotron
  .configure({
    name: 'Dater React Native (' + Platform.OS + ')' 
  })
  .use(trackGlobalErrors())
  .use(openInEditor())
  .use(overlay())
  .use(asyncStorage())
  .use(networking())
  .connect()
