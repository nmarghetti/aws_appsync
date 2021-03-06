#! /bin/bash

declare -r SCRIPT_ROOT=$(dirname "$(readlink -f "$0")")
cd "$SCRIPT_ROOT" || exit 1
declare -r GIT_ROOT=$(git rev-parse --show-toplevel)
source "$GIT_ROOT/scripts/install.sh"

export INSTALL_DEPS=(
  @babel/core @babel/preset-env # Babel
  @babel/node                   # Babel node to run single js file
)
export INSTALL_DEPS_DEV=(
)

install_main "$@"
