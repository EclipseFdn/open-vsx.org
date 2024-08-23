#!/usr/bin/env bash

#*******************************************************************************
# Copyright (c) 2024 Eclipse Foundation and others.
# This program and the accompanying materials are made available
# under the terms of the Eclipse Public License 2.0
# which is available at http://www.eclipse.org/legal/epl-v20.html
# SPDX-License-Identifier: EPL-2.0
#*******************************************************************************

# Bash strict-mode
set -o errexit
set -o nounset
set -o pipefail

IFS=$'\n\t'
SCRIPT_FOLDER="$(dirname "$(readlink -f "${0}")")"
ROOT_DIR="${SCRIPT_FOLDER}/.."

release_name_staging="staging"
release_name_production="production"
chart_name="openvsx"
namespace="open-vsx-org"

environment="${1:-}"
image_tag="${2:-}"

# check that environment is not empty
if [[ -z "${environment}" ]]; then
  printf "ERROR: an environment ('staging' or 'production') must be given.\n"
  exit 1
fi

# check that image_tag is not empty
if [[ -z "${image_tag}" ]]; then
  printf "ERROR: an image_tag must be given.\n"
  exit 1
fi

if [[ "${environment}" == "staging" ]]; then
  values_file="${ROOT_DIR}/charts/${chart_name}/values-staging.yaml"
  release_name="${release_name_staging}"
elif [[ "${environment}" == "production" ]]; then
  values_file="${ROOT_DIR}/charts/${chart_name}/values.yaml"
  release_name="${release_name_production}"
else
  printf "ERROR: Unknown environment. Only 'staging' or 'production' are supported.\n"
  exit 1
fi

if helm list -n "${namespace}" | grep "${release_name}" > /dev/null; then
  echo "Found installed Helm chart for release name '${release_name}'. Upgrading..."
  action="upgrade"
else
  echo "Found no installed Helm chart for release name '${release_name}'. Installing..."
  action="install"
fi

helm "${action}" "${release_name}" "${ROOT_DIR}/charts/${chart_name}" -f "${values_file}" --set image.tag="${image_tag}" --namespace "${namespace}"
  