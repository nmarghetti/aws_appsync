import Amplify, { API, graphqlOperation } from 'aws-amplify';
import awsconfig from './aws-exports';
Amplify.configure(awsconfig);

const querySchema = `{ __schema { types { name } } }`;

Auth.get;

console.log(
  'You can also check with this command:\n',
  `curl -XPOST -H "Content-Type:application/graphql" -H "x-api-key:${awsconfig.aws_appsync_apiKey}" -d '{ "query": "${querySchema}" }' "${awsconfig.aws_appsync_graphqlEndpoint}"`,
  '\n',
);

API.graphql(graphqlOperation(querySchema))
  .then((result) => console.log(JSON.stringify(result)))
  .catch((error) => console.log('Error:', error));
