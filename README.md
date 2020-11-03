# AWS AppSync

## Examples

- [01_aws_apikey](01_aws_apikey/readme.md): Simple call with AWS and APIKEY
- [02_aws_appsync_apikey](02_aws_appsync_apikey/readme.md): Simple call using Apollo with AppSync and APIKEY
- [03_aws_appsync_iam](03_aws_appsync_iam/readme.md): Simple call using Apollo with AppSync and IAM
- [04_aws_appsync_cognito](04_aws_appsync_cognito/readme.md): Simple call using Apollo with AppSync and Congnito/IAM
- [05_aws_appsync_apollo3](05_aws_appsync_apollo3/readme.md): Simple call using Apollo 3 with AppSync and Congnito/IAM
- [10_react_app_authentication](10_react_app_authentication/readme.md): React app with amplify authenticator to check sign in
- [11_react_app_queries](11_react_app_queries/readme.md): React app with graphql queries with class and apollo 2
- [12_react_app_queries_hooks](12_react_app_queries_hooks/readme.md): React app with graphql queries with hooks and apollo 3

## Documentation

- Amplify: [Amplify CLI](https://docs.amplify.aws/lib/graphqlapi/getting-started/q/platform/js), [Authentication](https://docs.amplify.aws/lib/auth/getting-started/q/platform/js#create-authentication-service), [Team work commands](https://docs.amplify.aws/cli/teams/commands)
- [AWS profile](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html), [AWS multi env](https://docs.aws.amazon.com/amplify/latest/userguide/multi-environments.html)
- [AWS SDK](https://aws.amazon.com/developers/getting-started/nodejs/) for Node.js
- AppSync: [Documentation](https://docs.aws.amazon.com/appsync/latest/devguide/welcome.html), [Security](https://docs.aws.amazon.com/appsync/latest/devguide/security.html#using-additional-authorization-modes)
- [GraphQL API Security with AWS AppSync and Amplify](https://aws.amazon.com/blogs/mobile/graphql-security-appsync-amplify/)
- Apollo: [Client](https://www.apollographql.com/docs/react/), [VSCode extension](https://www.apollographql.com/docs/devtools/editor-plugins/), [Server](https://www.apollographql.com/docs/apollo-server/)

## Start amplify from scratch

### Configure your AWS credentials

- Get you access key and secret from AWS console (on your account menu, select `My Security Credentials`)
- Create your profile

  ```bash
  # It will ask you for your access key and secret
  ./scripts/amplify_config.sh -p admin

  # It can be useful to define a default profile, better create another user that does not have admin rights
  ./scripts/amplify_config.sh -p default
  ```

  That will create 2 files in `.aws` folder in your home folder (%USERPROFILE% for Windows or ~ for Linux), in `.aws` folder the file `.aws/credentials with such content`:

  - credentials

    ```ini
    [admin]
    aws_access_key_id = <admin access key id>
    aws_secret_access_key = <admin secret key>

    [default]
    aws_access_key_id = <default access key id>
    aws_secret_access_key = <default secret key>
    ```

  - config

    ```ini
    [admin]
    region=eu-west-1

    [default]
    region=eu-west-1
    ```

### Initialize the differents environments for your application

```bash
# If you dont set a profile it will save access key and secret in a file in .amplify/awscloudformation (better avoid that)
AWS_PROFILE=admin AMPLIFY_ENV=prod ./scripts/amplify_init.sh <project_name>
AWS_PROFILE=admin AMPLIFY_ENV=test ./scripts/amplify_init.sh <project_name>
AWS_PROFILE=admin AMPLIFY_ENV=dev ./scripts/amplify_init.sh <project_name>
```

You can then check your environments

```bash
amplify env list
```

### Setup IAM

## Setup the project

## Setup amplify for any new developer

1. Create IAM developer policy and developer group

1. Create developer environment

   - Create the new user in [IAM](https://console.aws.amazon.com/iam/home?region=eu-west-1#/users) with developer group
   - Provide the new developer its Access key and secret or ask to log in [AWS console](https://console.aws.amazon.com/iam/home?region=eu-west-1#/security_credentials)
   - Ask the developer to set its `credentials` file (profile set to something different than admin)

1. Ask developer to clone the repo and and setup its amplify env

   ```bash
   amplify init
   # Do you want to use an existing environment? Yes
   # Choose the environment you would like to use: dev
   # Choose your default editor: Visual Studio Code
   # Do you want to use an AWS profile? Yes
   # Please choose the profile you want to use -> select the one your put in your credentials file
   ```

```bash
npx tsconfig.json
```
