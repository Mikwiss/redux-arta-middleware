# redux-arta-middleware

Redux middleware for an API REST server. *ARTA* is for **Api Rest Thunk Axios**.

## "Késako"

I wanted to provide to my first *react-redux* app, a service in order to refresh my token in each request. So i tried to make a middleware. Guess what ? Middleware are awesome. I put on it all async call (thanks to [axios](https://github.com/axios/axios)). So, when i want to send a request to the API server, i just need to dispatch a specific action and the middleware automatically refresh the token if needed, and dispatch result to the app's store.

## Getting Started

### Prerequisites

It's obvious, but this package use [redux](https://redux.js.org/).

*redux-arta-middleware* use also [redux-thunk](https://github.com/gaearon/redux-thunk) in order to be able to use function instead of action.

### Installation

For now, clone the repo inside your project as a classic module.

```
yarn add redux-arta-middleware
```

### How to use it ?

First, import *arta* reducer and combine with yrous others reducers.

```javascript
import { artaReducer } from 'redux-arta-middleware';
import { combineReducers } from 'redux';

const rootReducer  = combineReducers({
  arta: artaReducer,
  ... others reducers ...
})
```

Next, we have to create *arta* middleware to catch server request in order to set *OAuth2* token.

```javascript
import { createStore, applyMiddleware } from 'redux';
import { createArtaMiddleware } from 'redux-arta-middleware';

const artaMiddleware = createArtaMiddleware({
  baseURL: 'http://127.0.0.1:3004',
  headers: {'Content-Type': 'application/json'},
  authURL: `/oauth/v2/token`,
  refreshURL: `/oauth/v2/token`,
  clientID: 'my_client_ID',
  clientSecret: 'my_client_secret'
});

let store = createStore(
  rootReducer,
  applyMiddleware(reduxThunk, artaMiddleware)
);

ReactDOM.render(
  <Provider store={ store }>
    <App />
  </Provider>,
  document.getElementById('root'));
```

*Arta* middleware default option :

```javascript
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
```


## Versioning

## Authors


## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
