/**
 * Actions descriptor
 * ---------------------
 *
 * @author  Mikwiss (@mikwiss)
 * @license ISC
 *
 */
export const AUTHENTICATED = '@@connect/AUTHENTICATED';
export const UNAUTHENTICATED = '@@connect/UNAUTHENTICATED';
export const AUTHENTICATION_ERROR = '@@connect/AUTHENTICATION_ERROR';

export const IS_FETCHING = '@@connect/IS_FETCHING';
export const END_IS_FETCHING = '@@connect/END_IS_FETCHING';
export const PARTIAL_END_IS_FETCHING = '@@connect/PARTIAL_END_IS_FETCHING';

// TODO : make params oauth request as midleware parameter
// TODO : Make symbol as default parameter
export const REQUEST_API = Symbol("REQUEST_API");
export const CONNECT_API = Symbol("CONNECT_API");
export const REFRESH_TOKEN_API = Symbol("REFRESH_TOKEN_API");
export const DISCONNECT_API = Symbol("DISCONNECT_API");

export function signOutAction(action) {
  return {
    [DISCONNECT_API]: {
      nextAction: action
    }
  }
}

export function signInAction({ id, password }, action) {
  return {
    [CONNECT_API]: {
      user: { id, password },
      nextAction: action
    }
  };
}
