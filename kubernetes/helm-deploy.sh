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
namespace_staging="open-vsx-org-staging"

environment="${1:-}"
image_tag="${2:-}"

# check that environment is not empty
if [[ -z "${environment}" ]]; then
  printf "ERROR: an environment ('staging' or 'production' or 'aws-staging') must be given.\n"
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
  namespace="${namespace_staging}"
elif [[ "${environment}" == "aws-staging" ]]; then
  values_file="${ROOT_DIR}/charts/${chart_name}/values-aws-staging.yaml"
  release_name="${release_name_staging}"
  namespace="${namespace_staging}"
elif [[ "${environment}" == "production" ]]; then
  values_file="${ROOT_DIR}/charts/${chart_name}/values.yaml"
  release_name="${release_name_production}"
else
  printf "ERROR: Unknown environment. Only 'staging' or 'production' or 'aws-staging' are supported.\n"
  exit 1
fi

chmod 600 "${KUBECONFIG}"

export HELM_CACHE_HOME="${ROOT_DIR}/.helm/cache"
export HELM_CONFIG_HOME="${ROOT_DIR}/.helm/config"
export HELM_DATA_HOME="${ROOT_DIR}/.helm/data"

mkdir -p "${HELM_CACHE_HOME}"
mkdir -p "${HELM_CONFIG_HOME}"
mkdir -p "${HELM_DATA_HOME}"

helm version
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add postgresql https://charts.bitnami.com/bitnami
helm repo add eks https://aws.github.io/eks-charts
helm repo add external-dns https://kubernetes-sigs.github.io/external-dns/
helm dependency build  "${ROOT_DIR}/charts/openvsx"
helm upgrade --install "${release_name}" "${ROOT_DIR}/charts/openvsx" -f "${values_file}" --set image.tag="${image_tag}" --namespace "${namespace}"
