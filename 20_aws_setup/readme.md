# AWS SDK playground

Example to list, create or update some object in AWS such as IAM policies.

First ensure to configure your credential file ~/.aws/credentials.

```ini
[default]
aws_access_key_id=xxx
aws_secret_access_key=xxxxxx
```

Install and run.

```bash
yarn install
# run main.sj
yarn start

# run specific file, eg. iam_group_setup.js
yarn babel-node iam_group_setup.js
```
