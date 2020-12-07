#!/usr/bin/env bash

# Bash strict-mode
set -o errexit
set -o nounset
set -o pipefail

IFS=$'\n\t'
SCRIPT_FOLDER="$(dirname "$(readlink -f "${BASH_SOURCE[0]}")")"

ENV_NAME="${1}"
IMAGE_TAG="${2}"
FORMAT="${3:-"YAML"}"

if [[ "${FORMAT}" == "YAML" ]]; then
  read -r -d '' PROG <<EOF || :
  local openvsx = import "${SCRIPT_FOLDER}/open-vsx.org.libsonnet";
  openvsx.newKubernetesYamlStream("${ENV_NAME}", "${IMAGE_TAG}")
EOF
  jsonnet -S -e "${PROG}"
elif [[ "${FORMAT}" == "JSON" ]]; then
  read -r -d '' PROG <<EOF || :
  local openvsx = import "${SCRIPT_FOLDER}/open-vsx.org.libsonnet";
  openvsx.newKubernetesResources("${ENV_NAME}", "${IMAGE_TAG}")
EOF
  jsonnet -e "${PROG}"
else
  echo "Unknonw format '${FORMAT}'"
  exit 5
fi

