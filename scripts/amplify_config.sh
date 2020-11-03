#! /bin/bash

SCRIPT_NAME=$(basename "$0")
SCRIPT_ROOT=$(dirname "$(readlink -f "$0")")

function usage() {
  echo "Setup AWS profile"
  echo "Usage: $SCRIPT_NAME -p profile -k access_key [-s secret_access_key -r region]"
  echo -e "\t -h: Help"
  echo -e "\t -p: profile name"
  echo -e "\t -a: access_key that you would find in AWS console with 'My Security Credentials' item from your account menu"
  echo -e "\t -s: secret access key (if not provided it will be asked)"
  echo -e "\t -r: region (default=$region)"
  echo "eg. $SCRIPT_NAME -p admin -a AKIAYJSBGONRAX2O2AVI"
}

profile=
key=
secret=
region=eu-west-1

while getopts hp:r:k:s: opt; do
  case ${opt} in
  p) profile=${OPTARG} ;;
  r) region=${OPTARG} ;;
  k) key=${OPTARG} ;;
  s) secret=${OPTARG} ;;
  h)
    usage
    exit 0
    ;;
  \?)
    usage
    exit 2
    ;;
  esac
done
shift $(expr ${OPTIND} - 1)

[[ -z "$profile" ]] && read -p "Profile name:" profile
[[ -z "$key" ]] && read -p "Access key name:" key
[[ -z "$secret" ]] && secret=$(read_secret "Secret access key:")

"$SCRIPT_ROOT/amplify_config.py" -p "$profile" -k "$key" -s "$secret" -r "$region"
