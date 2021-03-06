# redux-arta-middleware

Redux middleware for an API REST server. *ARTA* is for **Api ResT Axios**.

## "Késako"

I wanted to provide to my first *react-redux* app, a service in order to refresh my token in each request. So i tried to make a middleware. Guess what ? Middleware are awesome. I put on it all async call (thanks to [axios](https://github.com/axios/axios)). So, when i want to send a request to the API server, i just need to dispatch a specific action and the middleware automatically refresh the token if needed, and dispatch result to the app's store.

## Getting Started

### Prerequisites

It's obvious, but this package use [redux](https://redux.js.org/).

Deprecated : *redux-arta-middleware* use also [redux-thunk](https://github.com/gaearon/redux-thunk) in order to be able to use function instead of action.

### Installation

For now, clone the repo inside your project as a classic module.

## Arta middleware

### Create middleware and reducer

First, import *arta* reducer and combine with yours others reducers.

```javascript
import { artaReducer } from './redux-arta-middleware';
import { combineReducers } from 'redux';

const rootReducer  = combineReducers({
  arta: artaReducer,
  ... others reducers ...
})
```

Next, we have to create *arta* middleware to catch server request in order to set *OAuth2* token.

```javascript
import { createStore, applyMiddleware } from 'redux';
import { createArtaMiddleware } from './redux-arta-middleware';

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

For now, *Arta* middleware default options are :

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

### Get, refresh and delete token

*ARTA* provide four [Symbol](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Symbol) :

```javascript
import { REQUEST_API, CONNECT_API, REFRESH_TOKEN_API, DISCONNECT_API }          from './redux-arta-middleware';
```

*ARTA* middleware catch this symbol action and let classic action through away.

##### CONNECT_API

To connect your app to the API, create a function :

```javascript
export function connectMyAppToTheApi(email, password) {
  return {
      [CONNECT_API]: {
        user: {
          id: email,
          passsword: password
        }
      }
    }
}
```

Use this function wherever you have access to the *dispatch* method :

```javascript
import { connectMyAppToTheApi } from './myActions';

dispatch(connectMyAppToTheApi(email, password)),
```

If the request is successfull, the middleware dispacth an *AUTHENTICATED* action and save the token into the local storage. Otherwise an *AUTHENTICATION_ERROR*.

##### REFRESH_TOKEN_API

You can refresh your token whenever you want thanks to the *REFRESH_TOKEN_API* symbol :

```javascript
function refreshMyToken() {
  return {
      [REFRESH_TOKEN_API]: {
      }
    }
}

dispatch(refreshMyToken()),
```

If the request is successfull, the middleware dispacth an *AUTHENTICATED* action an save the token into the local storage. Otherwise an *AUTHENTICATION_ERROR*.

##### DISCONNECT_API

You can disconnect your app whenever you want thanks to the *DISCONNECT_API* symbol :

```javascript
function disconnectMyApp() {
  return {
      [DISCONNECT_API]: {
      }
    }
}

dispatch(disconnectMyApp()),
```

No request needed for this action. The middleware remove token from the local storage and dispacth an *UNAUTHENTICATED* action.

### Request the API

##### Symbol REQUEST_API

In order to send a request to the API, you have to declare a action creator with the generic Symbol *REQUEST_API* :

```javascript
// Get post by id
function getPost(postId) {
  return {
      [REQUEST_API]: {
        method: 'GET',
        url: '/api/posts/' + postId
      }
    }
}

dispatch(getPost(1));
```

##### Success action

Now, in order to have a response, let declare a success action into the action creator !

```javascript
// Declare action
export const SUCCESS_GET_POST = "SUCCESS_GET_POST";

// Get post by id
function getPost(postId) {
  return {
      [REQUEST_API]: {
        method: 'GET',
        url: '/api/posts/' + postId,
        successType: SUCCESS_GET_POST
      }
    }
}

dispatch(getPost(1));
```

And the associated reducer :

```javascript
import { SUCCESS_GET_POST } from './actions';

function postReducer(state={ post: undefined }, action) {
  switch(action.type) {
    case SUCCESS_GET_POST:
      return { ...state, post: action.payload };
    default:
      return { ...state };
  }
}
```

##### Start and error action

You can also declare a start action and an error action. The first one is dispatched the specified action before the request API (usefull for set an *isFetching*), and the second one is dispatched when any errors occurred.

```javascript
// Declare actions
export const SUCCESS_GET_POST = "SUCCESS_GET_POST";
export const START_GET_POST = "START_GET_POST";
export const ERROR_GET_POST = "ERROR_GET_POST";

// Get post by id
function getPost(postId) {
  return {
      [REQUEST_API]: {
        method: 'GET',
        url: '/api/posts/' + postId,
        successType: SUCCESS_GET_POST,
        sendingType: START_GET_POST,
        errorType: ERROR_GET_POST
      }
    }
}

dispatch(getPost(1));
```

##### Chained action (beta)

It is possible to dispatch an action after a first one.

```javascript
// Get post by id
function getPost(postId, nextAction) {
  return {
      [REQUEST_API]: {
        method: 'GET',
        url: '/api/posts/' + postId,
        successType: SUCCESS_GET_POST,
        nextAction: nextAction
      }
    }
}

// Get author by id
function getAuthor(authorId) {
  return {
      [REQUEST_API]: {
        method: 'GET',
        url: '/api/users/' + authorId,
        successType: SUCCESS_GET_AUTHOR
      }
    }
}

function getPostWithAuthor(postId) {
  return getPost(postId, (payload) => {
    // Return error action if is not possible to execute next action
    if (payload === undefined) {
      return {
        type: ERROR_GET_POST,
        error: "No post id"
      }
    }
    // Return the next action
    return getAuthor(payload.authorId);
  });
}

dispatch(getPostWithAuthor(1));
```

**Note** : You can chained more than two action. But it's not tested feature for now.

##### Final code (beta)

Your final can look like this :

```javascript
// Declare actions
export const SUCCESS_GET_POST = "SUCCESS_GET_POST";
export const START_GET_POST = "START_GET_POST";
export const ERROR_GET_POST = "ERROR_GET_POST";
export const SUCCESS_GET_AUTHOR = "SUCCESS_GET_AUTHOR";
export const START_GET_AUTHOR = "START_GET_AUTHOR";
export const ERROR_GET_AUTHOR = "ERROR_GET_AUTHOR";


// Get post by id
function getPost(postId, nextAction) {
  return {
      [REQUEST_API]: {
        method: 'GET',
        url: '/api/posts/' + postId,
        successType: SUCCESS_GET_POST,
        sendingType: START_GET_POST,
        errorType: ERROR_GET_POST,
        nextAction: nextAction
      }
    }
}

// Get author by id
function getAuthor(authorId) {
  return {
      [REQUEST_API]: {
        method: 'GET',
        url: '/api/users/' + authorId,
        successType: SUCCESS_GET_AUTHOR,
        sendingType: START_GET_AUTHOR,
        errorType: ERROR_GET_AUTHOR,
        nextAction: nextAction
      }
    }
}

function getPostWithAuthor(postId) {
  return getPost(postId, (payload) => {
    // Return error action if is not possible to execute next action
    if (payload === undefined) {
      return {
        type: ERROR_GET_POST,
        error: "No post id"
      }
    }
    // Return the next action
    return getAuthor(payload.authorId);
  });
}

dispatch(getPostWithAuthor(1));
```

### API fetching

For each *REQUEST_API* made, a specific action is dispatch by the *arta middleware* : *IS_FETCHING*.

```javascript
export const IS_FETCHING = '@@arta-middleware/IS_FETCHING';
```

At the end of the request, a *END_IS_FETCHING* action is dispatched.

```javascript
export const END_IS_FETCHING = '@@arta-middleware/END_IS_FETCHING';
```

If the middleware catch a few *REQUEST_API* before receive a response, it dispatch before *END_IS_FETCHING* a partial *is fetching* action : *PARTIAL_END_IS_FETCHING* for each request and a final *END_IS_FETCHING* when all request have a server response (or error).

```javascript
export const PARTIAL_END_IS_FETCHING = '@@arta-middleware/PARTIAL_END_IS_FETCHING';
```

### Action dispacthed workflow

According to our final code (see below), the action are dispatched in the following order :

1. **IS_FETCHING** *{ count : 1 }*
2. START_GET_POST
3. SUCCESS_GET_POST
4. **IS_FETCHING** *{ count : 2 }*
5. START_GET_AUTHOR
6. **PARTIAL_END_IS_FETCHING** *{ count : 1 }*
7. SUCCESS_GET_AUTHOR
8. **END_IS_FETCHING** *{ count : 0 }*

## Versioning

- [x] 0.0.1 - first version on github
- [ ] Implement tests
- [ ] Make it more generic

## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
