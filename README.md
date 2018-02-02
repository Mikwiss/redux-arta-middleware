# redux-arta-middleware

Redux middleware for an API REST server.
ARTA is for Api Rest Thunk Axios, yeah this is not fun.

## Getting Started

In order to use ARTA middleware

### Prerequisites

It's obvious, but this package use [redux](https://redux.js.org/).

redux-arta-middleware use [redux-thunk](https://github.com/gaearon/redux-thunk) in order to be able to use function instead of action.

### Installation

**Not on npm yet**

```
npm install redux-arta-middleware
```

And if you're cool :

```
yarn add redux-arta-middleware
```

### How to use it ?

```javascript
import { createStore, applyMiddleware } from 'redux';
// Log all actions
import { createLogger } from 'redux-logger'
```

```javascript
import { createArtaMiddleware } from 'redux-arta-middleware';
import { artaReducer } from 'redux-arta-middleware';
```

## Versioning

## Authors


## License
This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.
