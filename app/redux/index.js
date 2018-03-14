import { combineReducers } from 'redux'

import * as authRedux from './authRedux'
import * as geoRedux from './geoRedux'
import * as usersAroundRedux from './usersAroundRedux'

export const reducer = combineReducers({
  auth: authRedux.reducer,
  geo: geoRedux.reducer,
  usersAround: usersAroundRedux.reducer,
})

export const authActionCreators = authRedux.authActionCreators
export const geoActionCreators = geoRedux.geoActionCreators
export const usersAroundCreators = usersAroundRedux.usersAroundActionCreators
