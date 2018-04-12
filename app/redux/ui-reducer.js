const types = {
  UI_MAP_PANEL_SHOW: 'UI_MAP_PANEL_SHOW',
  UI_MAP_PANEL_HIDE: 'UI_MAP_PANEL_HIDE',
};

const initialState = {
  mapPanelShown: false,
  error: null,
};

const uiReducer = (state = initialState, action) => {
  const { type, payload } = action;

  switch (type) {
    case types.UI_MAP_PANEL_SHOW: {
      return {
        ...state,
        mapPanelShown: true,
        heading: payload,
      };
    }
    case types.UI_MAP_PANEL_HIDE: {
      return {
        ...state,
        mapPanelShown: false,
        heading: payload,
      };
    }
    default: {
      return state;
    }
  }
};

export default uiReducer;
