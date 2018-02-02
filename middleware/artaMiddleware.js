/**
 * ARTA Middleware
 * ---------------------
 *
 * @author  Mikwiss (@mikwiss)
 * @license MIT
 *
 */

import axios from 'axios';

import { onSuccess, onError } from './../core/request';

import { hasAuthToken,
  getAuthToken,
  setAuthToken,
  removeAuthToken,
  shouldRefreshToken,
  isAccessTokenValid } from './../core/token';

import { AUTHENTICATED, UNAUTHENTICATED, AUTHENTICATION_ERROR, REQUEST_API, CONNECT_API, DISCONNECT_API, REFRESH_TOKEN_API } from './../actions/authActions';
import { IS_FETCHING, PARTIAL_END_IS_FETCHING, END_IS_FETCHING } from './../actions/fetchActions';


import defaults from './defaults';

/**
 * Creates token middleware with following options
 *
 * @namespace
 * @param {object} options - options for middleware
 *
 * @returns {function} token middleware
 */
function createArtaMiddleware(options = {}) {
  const requestOptions = Object.assign({}, defaults, options);

  const {
    baseURL,
    headers,
    clientID,
    clientSecret,
    refreshURL,
    authURL,
    refreshGrantType,
    authGrantType,
    shouldRefreshTokenOnEachRequest
  } = requestOptions;

  const oauthAxiosInstance = axios.create({
    baseURL: baseURL,
    headers: headers,
    method: 'GET',
    params: {
      client_id: clientID,
      client_secret: clientSecret
    }
  });

  const instance = axios.create({
    baseURL: baseURL,
    headers: headers
  });

  const requestServerAPI = function(options) {
    return instance(options)
              .then(onSuccess)
              .catch(onError);
  }

  const oauthAxiosRequest = function(options) {
    return oauthAxiosInstance(options)
              .then(onSuccess)
              .catch(onError);
  }

  if (shouldRefreshTokenOnEachRequest) {
    instance.interceptors.request.use(
      (config) => {
        return refreshTokenBeforeRequestAPI().then((tokenResponse) => {
          // Insert the new token
          if (tokenResponse != null) {
            config.headers.Authorization = `Bearer ${tokenResponse}`;
          }
          return Promise.resolve(config);
        }).catch((error) => {
          // Decide what to do if you can't get your token
          console.error(error);
          return Promise.reject(error);
        })
      },
      (error) => {
        return Promise.reject(error);
    });
  }

  const startIsFetchingAction = () => {
    cptFetch++;
    return {
       type: IS_FETCHING,
       count: cptFetch
    }
  }

  // TODO : if error, don't check cpt
  const endIsFetchingAction = () => {
    cptFetch--;
    if (cptFetch <= 0) {
      return {
         type: END_IS_FETCHING
      }
    } else {
      return {
         type: PARTIAL_END_IS_FETCHING,
         count: cptFetch
      }
    }
  }

  // Get access token from credential
  const getAccessTokenFromCredentialAction = ({ id, password }, nextAction) => {
    return async (dispatch) => {

      dispatch(startIsFetchingAction());

      await oauthAxiosRequest({
        url:    authURL,
        method: 'GET',
        params: {
          grant_type: authGrantType,
          username: id,
          password: password
        }
      }).then((response) => {
        // All right, we have a new access token.
        setAuthToken(response);
        dispatch({ type: AUTHENTICATED });
        if (nextAction !== undefined) {
          dispatch(nextAction);
        }
        dispatch(endIsFetchingAction());
      }).catch(error => {
        // Can't have a new access token. A problem occurs.
        removeAuthToken();
        dispatch({ type: AUTHENTICATION_ERROR, payload: error });
        dispatch(endIsFetchingAction());
      });
    };
  }

  // Get access token from credential
  const getAccessTokenFromRefreshTokenAction = () => {
    return async (dispatch) => {

      dispatch(startIsFetchingAction());

      if (hasAuthToken() ===  true) {
        await oauthAxiosRequest({
          url:    refreshURL,
          method: 'GET',
          params: {
            grant_type: refreshGrantType,
            refresh_token: getAuthToken().refresh_token
          }
        }).then((response) => {
          // All right, we have a new access token.
          setAuthToken(response);
          dispatch({ type: AUTHENTICATED });
          dispatch(endIsFetchingAction());
        }).catch(error => {
          // Can't have a new access token. A problem occurs.
          removeAuthToken();
          dispatch({ type: AUTHENTICATION_ERROR, payload: error });
          dispatch(endIsFetchingAction());
        });
      }
    };
  }

  // Get access token from refresh token
  const refreshTokenBeforeRequestAPI = () => {
    return new Promise((resolve, reject) => {
      if (hasAuthToken() ===  true) {
        if ((isAccessTokenValid() === false) || (shouldRefreshToken() === true)) {
          oauthAxiosRequest({
            url:    refreshURL,
            method: 'GET',
            params: {
              grant_type: refreshGrantType,
              refresh_token: getAuthToken().refresh_token
            }
          }).then((t) => {
            // All right, we have a new access token.
            setAuthToken(t);
            resolve(t.access_token);
          }).catch(error => {
            // Can't have a new access token. A problem occurs, reject request.
            console.error("Error inside getToken", error);
            reject(error);
          });
        } else {
          // refreshTokenAction(getAuthToken().refresh_token);
          // Resolve with current acces token.
          resolve(getAuthToken().access_token);
        }
      } else {
        // No auth ? Try without token.
        resolve(null);
      }
      // refreshTokenAction(getAuthToken().refresh_token);
      // Resolve with current acces token.
      resolve(getAuthToken().access_token);
    });
  }

  // The client request
  const doRequestServerAPI = (url, method, startAction, nextAction, successAction, errorAction) => {
    return async (dispatch) => {

      dispatch(startIsFetchingAction());

      if (startAction !== undefined) {
        dispatch({ type: startAction });
      }

      await requestServerAPI({
        method: method,
        url: url
      }).then(function (response) {
          if (successAction !== undefined) {
            dispatch({ type: successAction, payload: response });
          }
          // Evaluate un next action to do
          if (nextAction !== undefined) {
            dispatch(nextAction(response));
          }
          dispatch(endIsFetchingAction());
        }).catch(function (error) {
          if (errorAction !== undefined) {
            dispatch({ type: errorAction, payload: error });
          }
          dispatch(endIsFetchingAction());
        });
    };
  }

  // Init counter is fetching
  var cptFetch = 0;

  // Return the middleware function
  return ({ dispatch, getState }) => next => action => {
    // Catch action
    // Simple request
    if (action[REQUEST_API]) {
      const {
        method,
        url,
        sendingType,
        nextAction,
        successType,
        errorType
      } = action[REQUEST_API];

      dispatch(doRequestServerAPI(url, method, sendingType, nextAction, successType, errorType));
    } else if (action[CONNECT_API]) {
      const {
        user,
        nextAction
      } = action[CONNECT_API];
      dispatch(getAccessTokenFromCredentialAction(user, nextAction));
    } else if (action[REFRESH_TOKEN_API]) {
      dispatch(getAccessTokenFromRefreshTokenAction());
    } else if (action[DISCONNECT_API]) {
      const {
        nextAction
      } = action[DISCONNECT_API];
      removeAuthToken();
      dispatch({ type: UNAUTHENTICATED });
      if (nextAction !== undefined) {
        // TODO : determine why newtAction need () to dispatch
        dispatch(nextAction());
      }
    } else {
      // Pass to other middleware
      return next(action);
    }
  }
}

export { createArtaMiddleware };
