export const types = {
  UI_MAP_PANEL_READY: 'UI_MAP_PANEL_READY',
  UI_MAP_PANEL_UNLOAD: 'UI_MAP_PANEL_UNLOAD',
  UI_MAP_PANEL_SHOW_FINISHED: 'UI_MAP_PANEL_SHOW_FINISHED',
  UI_MAP_PANEL_HIDE_FORCE: 'UI_MAP_PANEL_HIDE_FORCE',
  UI_MAP_PANEL_HIDE_SNAPPED: 'UI_MAP_PANEL_HIDE_SNAPPED',
  UI_MAP_PANEL_SET_MODE: 'UI_MAP_PANEL_SET_MODE',
  UI_MAP_PANEL_ERROR: 'UI_MAP_PANEL_ERROR',
};

const initialState = {
  mode: null,
  previousMode: null,
  visible: false,
  pendingShow: false,
  user: {},
  error: null,
  canHide: true,
  previousState: {},
};

const mapPanelReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.UI_MAP_PANEL_SET_MODE: {
      return {
        ...state,
        ...payload,
        previousMode: state.mode,
      };
    }
    case types.UI_MAP_PANEL_SHOW_FINISHED: {
      return {
        ...state,
        visible: true,
        pendingShow: false,
        previousMode: state.mode || (payload && payload.mode),
      };
    }
    case types.UI_MAP_PANEL_HIDE_FORCE: {
      return {
        ...state,
        canHide: true,
        previousMode: '',
        previousState: {},
        // mode: '',
      };
    }
    case types.UI_MAP_PANEL_HIDE_SNAPPED: {
      return {
        ...state,
        visible: false,
        // previousMode: '',
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
