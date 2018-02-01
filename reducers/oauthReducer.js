/**
 * Oauth reducer
 * ---------------------
 *
 * @author  Mikwiss (@mikwiss)
 * @license MIT
 *
 */

import { AUTHENTICATED, UNAUTHENTICATED, AUTHENTICATION_ERROR, IS_FETCHING, PARTIAL_END_IS_FETCHING, END_IS_FETCHING } from './../actions/auth';
import { hasAuthToken } from './../core/token';

function oauthReducer(state={ authenticated: hasAuthToken(), isFetching: false, count: 0 }, action) {
  switch(action.type) {
    case AUTHENTICATED:
      return { ...state, authenticated: true };
    case UNAUTHENTICATED:
      return { ...state, authenticated: false };
    case AUTHENTICATION_ERROR:
      return { ...state, error: action.payload };
    case IS_FETCHING:
        return { ...state, isFetching: true, count: action.count };
    case PARTIAL_END_IS_FETCHING:
        return { ...state, isFetching: true, count: action.count};
    case END_IS_FETCHING:
        return { ...state, isFetching: false, count: 0 };
    default:
      return { ...state };
  }
}

export { oauthReducer };
