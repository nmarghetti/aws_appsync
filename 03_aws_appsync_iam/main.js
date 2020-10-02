import Amplify, { Auth } from 'aws-amplify';
import { AUTH_TYPE } from 'aws-appsync';
import { Credentials } from 'aws-sdk';
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

async function main() {
  try {
    const url = awsconfig.aws_appsync_graphqlEndpoint;
    const httpLink = createHttpLink({ uri: url, fetch: fetch });
    const region = awsconfig.aws_appsync_region;
    const auth = {
      type: AUTH_TYPE.AWS_IAM,
      credentials: () => new Credentials({ accessKeyId: awsconfig.accessKeyId, secretAccessKey: awsconfig.secretAccessKey }),
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

main();
