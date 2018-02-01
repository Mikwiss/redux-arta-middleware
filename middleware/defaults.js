/**
 * Default middleware option
 * ---------------------
 *
 * @author  Mikwiss (@mikwiss)
 * @license MIT
 *
 */

export default {
  baseURL: 'http://localhost:3001',
  headers: {'Content-Type': 'application/json'},
  clientID: undefined,
  clientSecret: undefined,
  authGrantType: 'password',
  authURL: `/oauth/token`,
  refreshGrantType: 'refresh_token',
  refreshURL: `/oauth/refresh`,
  shouldRefreshTokenOnEachRequest: true
};
