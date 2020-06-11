import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import { setContext } from 'apollo-link-context';
import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  split,
} from '@apollo/client';
import { getMainDefinition } from '@apollo/client/utilities';
import { WebSocketLink } from '@apollo/link-ws';

//the normal httpLink connection is modified so that the request's authorization header contains the token if one has been saved to the localStorage.
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem('user-token');
  return {
    headers: {
      ...headers,
      authorization: token ? `bearer ${token}` : null,
    },
  };
});

const httpLink = new HttpLink({ uri: 'http://localhost:4000' });
/* The new configuration is due to the fact that the application must have an HTTP connection as well as a WebSocket connection to the GraphQL server */
const wsLink = new WebSocketLink({
  uri: `ws://localhost:4000/graphql`,
  options: {
    reconnect: true,
  },
});
const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  authLink.concat(httpLink)
);

const client = new ApolloClient({
  cache: new InMemoryCache(),
  //The link parameter given to the client-object defines how apollo connects to the server.
  link: splitLink,
});

ReactDOM.render(
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);
