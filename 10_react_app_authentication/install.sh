#! /bin/bash

declare -r SCRIPT_ROOT=$(dirname "$(readlink -f "$0")")
cd "$SCRIPT_ROOT" || exit 1
declare -r GIT_ROOT=$(git rev-parse --show-toplevel)
source "$GIT_ROOT/scripts/install.sh"

export INSTALL_DEPS=(
  react react-dom react-scripts     # React
  aws-amplify @aws-amplify/ui-react # AWS
  @apollo/client                    # Apollo
)
export INSTALL_DEPS_DEV=(
  @testing-library/jest-dom @testing-library/react @testing-library/user-event # Testing
)

install_main "$@"
