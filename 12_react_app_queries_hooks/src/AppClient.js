import { ApolloClient, ApolloLink, HttpLink, InMemoryCache } from '@apollo/client';
import { onError } from '@apollo/client/link/error';

// Link to handle error during query
const errorLink = onError(({ graphQLErrors, networkError, forward, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.map(({ message, locations, path }) =>
      console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`),
    );
  } else if (networkError) console.log(`[Network error]: ${networkError}`);
  else {
    return forward(operation);
  }
  return null;
});

// Mock link
const mockLink = new ApolloLink((operation, forward) => {
  let query = null;
  // If mutation
  if (operation.operationName) {
    query = operation.operationName;
  } else {
    if (operation.query && operation.query.definitions) {
      operation.query.definitions.forEach((def) => {
        if (def.operation && def.operation === 'query') {
          def.selectionSet.selections.forEach((sel) => {
            query = sel.name.value;
          });
        }
      });
    }
  }

  return forward(operation).map((data) => {
    if (process.env.REACT_APP_RECORD_MOCK === 'Y') {
      console.log('Graphql request mock', {
        request: { query, variables: operation.variables },
        result: data,
      });
    }
    return data;
  });
});

// Add custom links to the given links
function getApolloLinks(links) {
  if (process.env.NODE_ENV === 'development') {
    return [errorLink, mockLink, ...links];
  }
  return [errorLink, ...links];
}

// Get an apollo client from given links
function getApolloClient(links) {
  const link = ApolloLink.from(getApolloLinks(links));
  return new ApolloClient({
    link,
    cache: new InMemoryCache(),
  });
}

// Get client to use in local with local graphql server
export function getClientLocal() {
  const url = `http://localhost:${process.env.REACT_APP_GRAPHQL_SERVER_PORT}/`;
  const httpLink = new HttpLink({ uri: url, fetch: fetch });
  return getApolloClient([httpLink]);
}
