const types = {
  UI_MAP_PANEL_READY: 'UI_MAP_PANEL_READY',
  UI_MAP_PANEL_UNLOAD: 'UI_MAP_PANEL_UNLOAD',
  UI_MAP_PANEL_SHOW_START: 'UI_MAP_PANEL_SHOW_START',
  UI_MAP_PANEL_SHOW_FINISHED: 'UI_MAP_PANEL_SHOW_FINISHED',
  UI_MAP_PANEL_HIDE_START: 'UI_MAP_PANEL_HIDE_START',
  UI_MAP_PANEL_HIDE_FINISHED: 'UI_MAP_PANEL_HIDE_FINISHED',
  UI_MAP_PANEL_SET_MODE: 'UI_MAP_PANEL_SET_MODE',
  UI_MAP_PANEL_ERROR: 'UI_MAP_PANEL_ERROR',
};

const initialState = {
  mode: '',
  visible: false,
  user: {},
  error: null,
};

const mapPanelReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.UI_MAP_PANEL_SET_MODE:
    case types.UI_MAP_PANEL_SHOW_START: {
      return {
        ...state,
        mode: payload.mode,
        user: payload.user,
      };
    }
    case types.UI_MAP_PANEL_SHOW_FINISHED: {
      return {
        ...state,
        visible: true,
      };
    }
    case types.UI_MAP_PANEL_HIDE_FINISHED: {
      return {
        ...state,
        visible: false,
      };
    }
    case types.UI_MAP_PANEL_ERROR: {
      return {
        ...state,
        error: payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default mapPanelReducer;
