#! /bin/bash

[[ -z "$GIT_ROOT" ]] && exit 1
source "$GIT_ROOT/scripts/common.sh"

function install_packages() {
  if [[ -z $INSTALL_DEPS ]]; then
    echo "No dependencies to install." && exit 1
  else
    echo "Install application packages..."
    $YARN add "${INSTALL_DEPS[@]}"
  fi

  if [[ -z $INSTALL_DEPS_DEV ]]; then
    echo "No dev dependencies to install."
  else
    echo "Install dev packages..."
    $YARN add --dev "${INSTALL_DEPS_DEV[@]}"
  fi
}

function install_lock() {
  $YARN install --frozen-lockfile
}

function install_main() {
  case "$1" in
  lock)
    install_lock
    ;;
  first)
    install_packages
    ;;
  list)
    $YARN list --depth 0
    npm list -g --depth 0
    ;;
  clean)
    echo "Cleaning not supported yet"
    ;;
  *)
    if [[ -f 'yarn.lock' ]]; then
      install_lock
    else
      install_packages
    fi
    ;;
  esac
}
