const types = {
  UI_MAP_PANEL_READY: 'UI_MAP_PANEL_READY',
  UI_MAP_PANEL_UNLOAD: 'UI_MAP_PANEL_UNLOAD',
  UI_MAP_PANEL_SHOW_START: 'UI_MAP_PANEL_SHOW_START',
  UI_MAP_PANEL_SHOW_FINISH: 'UI_MAP_PANEL_SHOW_FINISH',
  UI_MAP_PANEL_REPLACE_START: 'UI_MAP_PANEL_REPLACE_START',
  UI_MAP_PANEL_REPLACE_FINISH: 'UI_MAP_PANEL_REPLACE_FINISH',
  UI_MAP_PANEL_HIDE_START: 'UI_MAP_PANEL_HIDE_START',
  UI_MAP_PANEL_HIDE_FINISH: 'UI_MAP_PANEL_HIDE_FINISH',
};

const initialState = {
  visible: false,
  user: {},
  error: null,
};

const mapPanelReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.UI_MAP_PANEL_SHOW_START: {
      return {
        ...state,
        user: payload,
      };
    }
    case types.UI_MAP_PANEL_REPLACE_START: {
      return {
        ...state,
      };
    }
    case types.UI_MAP_PANEL_REPLACE_FINISH:
    case types.UI_MAP_PANEL_SHOW_FINISH: {
      return {
        ...state,
        visible: true,
        user: payload,
      };
    }
    case types.UI_MAP_PANEL_HIDE_START: {
      return {
        visible: false,
        ...state,
      };
    }
    case types.UI_MAP_PANEL_HIDE_FINISH: {
      return {
        ...state,
        visible: false,
      };
    }
    default: {
      return state;
    }
  }
};

export default mapPanelReducer;
