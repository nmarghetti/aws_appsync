#! /bin/bash

type node &>/dev/null || {
  echo "Error: node is not installed" && exit 1
}

type npm &>/dev/null || {
  echo "Error: npm is not installed" && exit 1
}

export YARN_VERSION=1.22.10
export AMPLIFY_CLI_VERSION=4.30.0

export YARN="$(dirname $(which node))/yarn"
if [ ! -e "$YARN" ]; then
  export YARN=$(which yarn)
fi

export AMPLIFY="$(dirname $(which node))/amplify"
if [ ! -e "$AMPLIFY" ]; then
  export AMPLIFY=$(which amplify)
fi

[[ "$($YARN --no-color --version)" == "$YARN_VERSION" ]] || {
  echo "Installing yarn $YARN_VERSION"
  npm install -g yarn@$YARN_VERSION
}

[[ "$($AMPLIFY --no-color --version)" == "$AMPLIFY_CLI_VERSION" ]] || {
  echo "Installing @aws-amplify/cli $AMPLIFY_CLI_VERSION"
  npm install -g @aws-amplify/cli@$AMPLIFY_CLI_VERSION
}
