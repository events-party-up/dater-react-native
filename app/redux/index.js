import { combineReducers } from 'redux'

import * as authRedux from './authRedux'
import * as geoRedux from './geoRedux'

export const reducer = combineReducers({
  auth: authRedux.reducer,
  geo: geoRedux.reducer
})

export const authActionCreators = authRedux.actionCreators
export const geoActionCreators = geoRedux.actionCreators
