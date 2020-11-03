#! /bin/bash

declare -r SCRIPT_ROOT=$(dirname "$(readlink -f "$0")")
cd "$SCRIPT_ROOT" || exit 1
declare -r GIT_ROOT=$(git rev-parse --show-toplevel)
source "$GIT_ROOT/scripts/install.sh"

export INSTALL_DEPS=(
  aws-sdk # AWS
)
export INSTALL_DEPS_DEV=(
  typescript @types/node # typescript
  nodemon                #node
)

install_main "$@"
