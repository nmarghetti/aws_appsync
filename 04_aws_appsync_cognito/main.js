import Amplify, { Auth } from 'aws-amplify';
import { AUTH_TYPE } from 'aws-appsync';
import { createAuthLink } from 'aws-appsync-auth-link';
import { createSubscriptionHandshakeLink } from 'aws-appsync-subscription-link';
import { ApolloLink } from 'apollo-link';
import { createHttpLink } from 'apollo-link-http';
import fetch from 'node-fetch';
import ApolloClient from 'apollo-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
import awsconfig from './aws-exports';

Amplify.configure(awsconfig);

const queryData = gql`
  {
    __schema {
      types {
        name
      }
    }
  }
`;

async function query() {
  try {
    const url = awsconfig.aws_appsync_graphqlEndpoint;
    const httpLink = createHttpLink({ uri: url, fetch: fetch });
    const region = awsconfig.aws_appsync_region;
    const auth = {
      type: AUTH_TYPE.AMAZON_COGNITO_USER_POOLS,
      jwtToken: async () =>
        await Auth.currentSession()
          .then((data) => data.getIdToken().getJwtToken())
          .catch((error) => console.log('Error with jwt token', error)),
    };
    const link = ApolloLink.from([createAuthLink({ url, region, auth }), createSubscriptionHandshakeLink(url, httpLink)]);

    const client = new ApolloClient({
      link,
      cache: new InMemoryCache(),
    });

    client
      .query({
        query: queryData,
      })
      .then((result) => console.log(JSON.stringify(result, null, 2)))
      .catch((reason) => console.log(`Error while querying queryData:`, reason));
  } catch (error) {
    console.error('An error occured:', error);
    process.exit(1);
  }
}

async function main() {
  // First query without being singed that fails
  query();
  // Sign in
  await Auth.signIn(awsconfig.aws_user, awsconfig.aws_user_pass)
    .then((data) => console.log('Authenticated:', data))
    .catch((error) => console.log('Authentication error:', error));
  // Check credentials: generated access key and secret access key
  Auth.currentCredentials().then((data) => console.log(data));
  // Second query that works
  query();
}

main();
