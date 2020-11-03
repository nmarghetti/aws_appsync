"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
function get_account_id() {
    return __awaiter(this, void 0, void 0, function* () {
        let account_id = null;
        yield new aws_sdk_1.default.STS()
            .getCallerIdentity()
            .promise()
            .then((data) => (account_id = data.Account))
            .catch((err) => console.log(err));
        return account_id;
    });
}
function dump_policies(iam, account_id) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const policies = yield iam.listPolicies({ Scope: 'Local' }).promise();
            policies.Policies &&
                policies.Policies.forEach((policy) => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    if (!policy.PolicyName || ['Developer'].indexOf(policy.PolicyName) === -1)
                        return;
                    if (policy.Arn === undefined || policy.DefaultVersionId === undefined)
                        return;
                    console.log('Policy:', policy.Arn);
                    const policy_data = yield iam.getPolicyVersion({ PolicyArn: policy.Arn, VersionId: policy.DefaultVersionId }).promise();
                    if (!((_a = policy_data.PolicyVersion) === null || _a === void 0 ? void 0 : _a.Document))
                        return;
                    const document = decodeURIComponent(policy_data.PolicyVersion.Document).replace(new RegExp(account_id, 'g'), '${account_id}');
                    fs_1.writeFile(path_1.default.join(__dirname, 'iam', `policy_${policy.PolicyName}.json`), document, (err) => {
                        if (err)
                            console.log(err);
                    });
                }));
        }
        catch (error) {
            console.log(error);
        }
    });
}
function dump_groups(iam) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const groups = yield iam.listGroups().promise();
            groups.Groups.forEach((group) => __awaiter(this, void 0, void 0, function* () {
                var _a;
                if (['admin', 'developer'].indexOf(group.GroupName) === -1)
                    return;
                const policies = yield iam.listAttachedGroupPolicies({ GroupName: group.GroupName }).promise();
                console.log(`Group: ${group.GroupName}`, ((_a = policies.AttachedPolicies) !== null && _a !== void 0 ? _a : []).map((policy) => policy.PolicyArn));
            }));
        }
        catch (error) {
            console.log(error);
        }
    });
}
function dump_users(iam) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const users = yield iam.listUsers().promise();
            users.Users.forEach((user) => __awaiter(this, void 0, void 0, function* () {
                const groups = yield iam.listGroupsForUser({ UserName: user.UserName }).promise();
                console.log(`User: ${user.UserName}`, groups.Groups.map((group) => group.Arn));
            }));
        }
        catch (error) {
            console.log(error);
        }
    });
}
function dump_pools(cognito) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pools = yield cognito.listUserPools({ MaxResults: 10 }).promise();
            pools.UserPools &&
                pools.UserPools.forEach((pool) => __awaiter(this, void 0, void 0, function* () {
                    var _a, _b;
                    if (!pool.Id)
                        return;
                    const groups = yield cognito.listGroups({ UserPoolId: pool.Id }).promise();
                    const users = yield cognito.listUsers({ UserPoolId: pool.Id }).promise();
                    console.log(`Pool ${pool.Name} (${pool.Id})`, '\n\tGroups:', ((_a = groups.Groups) !== null && _a !== void 0 ? _a : []).map((group) => group.GroupName), '\n\tUsers:', ((_b = users.Users) !== null && _b !== void 0 ? _b : []).map((user) => user.Username));
                }));
        }
        catch (error) {
            console.log(error);
        }
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        aws_sdk_1.default.config.getCredentials((err, data) => {
            if (err) {
                console.error(err);
                return;
            }
            console.log(`Access key: ${data === null || data === void 0 ? void 0 : data.accessKeyId}`);
            console.log(`Region: ${aws_sdk_1.default.config.region}`);
        });
        const account_id = yield get_account_id();
        console.log(`Account id: ${account_id}`);
        if (!account_id)
            return;
        const iam = new aws_sdk_1.default.IAM();
        yield dump_policies(iam, account_id);
        yield dump_groups(iam);
        yield dump_users(iam);
        const cognito = new aws_sdk_1.default.CognitoIdentityServiceProvider();
        yield dump_pools(cognito);
    });
}
main();
