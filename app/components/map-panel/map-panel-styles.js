import { StyleSheet } from 'react-native';

import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
} from '../../constants';

const Screen = {
  width: SCREEN_WIDTH,
  height: SCREEN_HEIGHT - 75,
};


const MapPanelStyles = StyleSheet.create({
  panelContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    top: 0,
    zIndex: 4,
  },
  panel: {
    height: Screen.height + 300,
    padding: 8,
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    borderRadius: 4,
    shadowColor: 'rgba(0, 0, 0, 0.2)',
    shadowRadius: 4,
    shadowOpacity: 1,
    shadowOffset: {
      width: 0, height: 0,
    },
    elevation: 1,
  },
  panelHeader: {
    marginLeft: 16,
    marginBottom: 8,
  },
  panelBody: {
    marginLeft: 16,
    marginBottom: 8,
    // marginTop: 8,
  },
  panelHandle: {
    width: 48,
    height: 4,
    borderRadius: 4,
    backgroundColor: '#00000040',
    marginBottom: 10,
    alignSelf: 'center',
  },
  panelButton: {
    alignItems: 'center',
    marginVertical: 8,
    alignSelf: 'center',
  },
});

export default MapPanelStyles;
