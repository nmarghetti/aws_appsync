#! /bin/bash

function usage() {
  echo "Usage:"
  echo "  amplify_init.sh <project_name>"
  exit 1
}

[[ -z "$1" ]] && usage

# access_key='AKIAYJSBGNNRCSEXTH4X'
# secret_access_key='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'
# access_key='AKIAYJSBGNNRAX2O2AVI'
# secret_access_key='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'

useProfile=false
profile=$AWS_PROFILE
# In case a AWS profile is given, not need to provide region nor access and secret keys
if [[ -n "$profile" ]]; then
  useProfile=true
else
  # Get the given region or use default eu-west-1
  region=$AWS_REGION
  [[ -z "$region" ]] && region=eu-west-1

  # access_key=$AWS_KEY
  [[ -z "$access_key" ]] && access_key=$(read_secret 'AWS access key:')
  # secret_access_key=$AWS_SECRET
  [[ -z "$secret_access_key" ]] && secret_access_key=$(read_secret 'AWS secret access key:')
fi

# Use given env or take username
env_name=$AMPLIFY_ENV
[[ -z "$env_name" ]] && env_name=$USERNAME

project='test_amplify'
[[ -n "$1" ]] && project=$1

REACTCONFIG="{\
\"SourceDir\":\"src\",\
\"DistributionDir\":\"build\",\
\"BuildCommand\":\"yarn build\",\
\"StartCommand\":\"yarn start\"\
}"
AWSCLOUDFORMATIONCONFIG="{\
\"configLevel\":\"project\",\
\"useProfile\":$useProfile,\
\"profileName\":\"$profile\",\
\"accessKeyId\":\"$access_key\",\
\"secretAccessKey\":\"$secret_access_key\",\
\"region\":\"$region\"\
}"
AMPLIFY="{\
\"projectName\":\"$project\",\
\"envName\":\"$env_name\",\
\"defaultEditor\":\"code\"\
}"
FRONTEND="{\
\"frontend\":\"javascript\",\
\"framework\":\"react\",\
\"config\":$REACTCONFIG}"
PROVIDERS="{\
\"awscloudformation\":$AWSCLOUDFORMATIONCONFIG}"

amplify init \
  --amplify $AMPLIFY \
  --frontend $FRONTEND \
  --providers $PROVIDERS \
  --yes
