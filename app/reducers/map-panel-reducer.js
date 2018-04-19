const types = {
  UI_MAP_PANEL_READY: 'UI_MAP_PANEL_READY',
  UI_MAP_PANEL_UNLOAD: 'UI_MAP_PANEL_UNLOAD',
  UI_MAP_PANEL_SHOW_START: 'UI_MAP_PANEL_SHOW_START',
  UI_MAP_PANEL_SHOW_FINISH: 'UI_MAP_PANEL_SHOW_FINISH',
  UI_MAP_PANEL_REPLACE_START: 'UI_MAP_PANEL_REPLACE_START',
  UI_MAP_PANEL_REPLACE_FINISH: 'UI_MAP_PANEL_REPLACE_FINISH',
  UI_MAP_PANEL_HIDE_START: 'UI_MAP_PANEL_HIDE_START',
  UI_MAP_PANEL_HIDE_FINISH: 'UI_MAP_PANEL_HIDE_FINISH',
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
    case types.UI_MAP_PANEL_REPLACE_START:
    case types.UI_MAP_PANEL_SHOW_START: {
      return {
        ...state,
        visible: true,
      };
    }
    case types.UI_MAP_PANEL_REPLACE_FINISH:
    case types.UI_MAP_PANEL_SHOW_FINISH: {
      return {
        ...state,
        mode: payload.mode,
        user: payload.user,
      };
    }
    case types.UI_MAP_PANEL_HIDE_START: {
      return {
        ...state,
        visible: false,
      };
    }
    case types.UI_MAP_PANEL_HIDE_FINISH: {
      return {
        ...state,
        user: {},
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
