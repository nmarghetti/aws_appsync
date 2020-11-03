import AWS from 'aws-sdk';
import { writeFile } from 'fs';
import path from 'path';

async function get_account_id(): Promise<string | null> {
  let account_id = null;
  await new AWS.STS()
    .getCallerIdentity()
    .promise()
    .then((data) => (account_id = data.Account))
    .catch((err) => console.log(err));
  return account_id;
}

async function dump_policies(iam: AWS.IAM, account_id: string) {
  try {
    const policies = await iam.listPolicies({ Scope: 'Local' }).promise();
    policies.Policies &&
      policies.Policies.forEach(async (policy) => {
        if (!policy.PolicyName || ['Developer'].indexOf(policy.PolicyName) === -1) return;
        if (policy.Arn === undefined || policy.DefaultVersionId === undefined) return;
        console.log('Policy:', policy.Arn);
        const policy_data = await iam.getPolicyVersion({ PolicyArn: policy.Arn, VersionId: policy.DefaultVersionId }).promise();
        if (!policy_data.PolicyVersion?.Document) return;
        const document = decodeURIComponent(policy_data.PolicyVersion.Document).replace(new RegExp(account_id, 'g'), '${account_id}');
        writeFile(path.join(__dirname, 'iam', `policy_${policy.PolicyName}.json`), document, (err) => {
          if (err) console.log(err);
        });
      });
  } catch (error) {
    console.log(error);
  }
}

async function dump_groups(iam: AWS.IAM) {
  try {
    const groups = await iam.listGroups().promise();
    groups.Groups.forEach(async (group) => {
      if (['admin', 'developer'].indexOf(group.GroupName) === -1) return;
      const policies = await iam.listAttachedGroupPolicies({ GroupName: group.GroupName }).promise();
      console.log(
        `Group: ${group.GroupName}`,
        (policies.AttachedPolicies ?? []).map((policy) => policy.PolicyArn),
      );
    });
  } catch (error) {
    console.log(error);
  }
}

async function dump_users(iam: AWS.IAM) {
  try {
    const users = await iam.listUsers().promise();
    users.Users.forEach(async (user) => {
      const groups = await iam.listGroupsForUser({ UserName: user.UserName }).promise();
      console.log(
        `User: ${user.UserName}`,
        groups.Groups.map((group) => group.Arn),
      );
    });
  } catch (error) {
    console.log(error);
  }
}

// async function dump_identities(cognito, account_id) {
//   const pools = await cognito
//     .listIdentityPools({ MaxResults: 10 })
//     .promise()
//     .then((data) => data)
//     .catch((err) => console.log(err));
//   pools.IdentityPools.forEach(async (identity) => {
//     // console.log(identity.IdentityPoolName);
//     const identities = await cognito
//       .listIdentities({ IdentityPoolId: identity.IdentityPoolId, MaxResults: 10 })
//       .promise()
//       .then((data) => data)
//       .catch((err) => console.log(err));
//     console.log(
//       `Pool ${identity.IdentityPoolName}:`,
//       identities.Identities.map((identity) => identity.Logins),
//     );
//   });
// }

async function dump_pools(cognito: AWS.CognitoIdentityServiceProvider) {
  try {
    const pools = await cognito.listUserPools({ MaxResults: 10 }).promise();
    pools.UserPools &&
      pools.UserPools.forEach(async (pool) => {
        if (!pool.Id) return;
        const groups = await cognito.listGroups({ UserPoolId: pool.Id }).promise();
        const users = await cognito.listUsers({ UserPoolId: pool.Id }).promise();
        console.log(
          `Pool ${pool.Name} (${pool.Id})`,
          '\n\tGroups:',
          (groups.Groups ?? []).map((group) => group.GroupName),
          '\n\tUsers:',
          (users.Users ?? []).map((user) => user.Username),
        );
      });
  } catch (error) {
    console.log(error);
  }
}

async function main() {
  // Get access key from credentials
  AWS.config.getCredentials((err, data) => {
    if (err) {
      console.error(err);
      return;
    }
    console.log(`Access key: ${data?.accessKeyId}`);
    console.log(`Region: ${AWS.config.region}`);
  });

  // Get account id
  const account_id = await get_account_id();
  console.log(`Account id: ${account_id}`);
  if (!account_id) return;

  // IAM
  const iam = new AWS.IAM();
  await dump_policies(iam, account_id);
  await dump_groups(iam);
  await dump_users(iam);

  // Cognito
  // const cognitoIdentity = new AWS.CognitoIdentity();
  // await dump_identities(cognitoIdentity, account_id);

  const cognito = new AWS.CognitoIdentityServiceProvider();
  await dump_pools(cognito);
}

main();
