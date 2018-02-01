/**
 * Local storage token manage
 * ---------------------
 *
 * @author  Mikwiss (@mikwiss)
 * @license MIT
 *
 */

const OAUTH_KEY_LOCALSTORAGE = 'authToken';
const SHOULD_REFRESH_TOKEN_BEFORE_EXPIRED = 600000;

function getLocalStorageAuthToken() {
  return JSON.parse(localStorage.getItem(OAUTH_KEY_LOCALSTORAGE));
}

function setLocalStorageAuthToken(token) {
  var currentDate = new Date().getTime();
  token = { ...token, date: currentDate };
  localStorage.setItem(OAUTH_KEY_LOCALSTORAGE, JSON.stringify(token));
}

function removeLocalStorageAuthToken() {
  localStorage.removeItem(OAUTH_KEY_LOCALSTORAGE);
}

export function getAuthToken(){
  return getLocalStorageAuthToken();
}

export function setAuthToken(token){
  return setLocalStorageAuthToken(token);
}

export function removeAuthToken(){
  return removeLocalStorageAuthToken();
}

export function hasAuthToken(){
  return (getLocalStorageAuthToken() != null);
}

export function shouldRefreshToken(){
  let token = getAuthToken();

  if (token == null)
    return null;

  let dateExpires = token.date + (token.expires_in * 1000) - SHOULD_REFRESH_TOKEN_BEFORE_EXPIRED;

  return (new Date().getTime() > dateExpires);
}

export function isAccessTokenValid(){
  let token = getAuthToken();

  if (token == null)
    return null;

  let dateCreate = token.date;
  let dateExpires = dateCreate + (token.expires_in * 1000);

  return (dateExpires > new Date().getTime());
}
