#! /bin/bash

type node &>/dev/null || {
  echo "Error: node is not installed" && exit 1
}

type npm &>/dev/null || {
  echo "Error: npm is not installed" && exit 1
}

export YARN_VERSION=1.22.10

export YARN="$(dirname $(which node))/yarn"
if [ ! -e "$YARN" ]; then
  export YARN=$(which yarn)
fi

[[ "$($YARN --version)" == "$YARN_VERSION" ]] || {
  echo "Installing yarn $YARN_VERSION"
  npm install -g yarn@$YARN_VERSION
}
