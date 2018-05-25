export const types = {
  UI_MAP_PANEL_READY: 'UI_MAP_PANEL_READY',
  UI_MAP_PANEL_UNLOAD: 'UI_MAP_PANEL_UNLOAD',
  UI_MAP_PANEL_SHOW: 'UI_MAP_PANEL_SHOW',
  UI_MAP_PANEL_SHOW_FINISHED: 'UI_MAP_PANEL_SHOW_FINISHED',
  UI_MAP_PANEL_HIDE: 'UI_MAP_PANEL_HIDE',
  UI_MAP_PANEL_HIDE_FORCE: 'UI_MAP_PANEL_HIDE_FORCE',
  UI_MAP_PANEL_HIDE_FINISHED: 'UI_MAP_PANEL_HIDE_FINISHED',
  UI_MAP_PANEL_SET_MODE: 'UI_MAP_PANEL_SET_MODE',
  UI_MAP_PANEL_ERROR: 'UI_MAP_PANEL_ERROR',
};

const initialState = {
  mode: '',
  visible: false,
  user: {},
  error: null,
  canHide: true,
};

const mapPanelReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.UI_MAP_PANEL_SET_MODE: {
      return {
        ...state,
        ...payload,
      };
    }
    case types.UI_MAP_PANEL_SHOW_FINISHED: {
      return {
        ...state,
        ...payload,
        visible: true,
      };
    }
    case types.UI_MAP_PANEL_HIDE_FORCE: {
      return {
        ...state,
        canHide: true,
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
