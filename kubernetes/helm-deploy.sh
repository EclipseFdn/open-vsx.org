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

release_name_test="test"
release_name_staging="staging"
release_name_production="production"
chart_name="openvsx"
namespace="open-vsx-org"
namespace_staging="open-vsx-org-staging"
namespace_test="open-vsx-org-test"

environment="${1:-}"
image_tag="${2:-}"

# DRY_RUN=1 ./helm-deploy.sh ... → render + server-side validate, do not apply.
DRY_RUN="${DRY_RUN:-}"

# check that environment is not empty
if [[ -z "${environment}" ]]; then
  printf "ERROR: an environment ('test', 'staging', 'aws-staging', 'aws-production' or 'production') must be given.\n"
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
elif [[ "${environment}" == "test" ]]; then
  values_file="${ROOT_DIR}/charts/${chart_name}/values-test.yaml"
  release_name="${release_name_test}"
  namespace="${namespace_test}"
elif [[ "${environment}" == "production" ]]; then
  values_file="${ROOT_DIR}/charts/${chart_name}/values.yaml"
  release_name="${release_name_production}"
elif [[ "${environment}" == "aws-production" ]]; then
  values_file="${ROOT_DIR}/charts/${chart_name}/values-aws.yaml"
  release_name="${release_name_production}"
else
  printf "ERROR: Unknown environment. Only 'test', 'staging', 'aws-staging', 'aws-production' or 'production' are supported.\n"
  exit 1
fi

# Deployment manifest's Values.environment — aws-* envs use values-aws-*.yaml which set environment=staging/production
if [[ "${environment}" == "aws-production" ]]; then
  deployment_env="production"
elif [[ "${environment}" == "aws-staging" ]]; then
  deployment_env="staging"
else
  deployment_env="${environment}"
fi

KUBECONFIG="${KUBECONFIG:-${HOME}/.kube/config}"
chmod 600 "${KUBECONFIG}"

export HELM_CACHE_HOME="${ROOT_DIR}/.helm/cache"
export HELM_CONFIG_HOME="${ROOT_DIR}/.helm/config"
export HELM_DATA_HOME="${ROOT_DIR}/.helm/data"

mkdir -p "${HELM_CACHE_HOME}"
mkdir -p "${HELM_CONFIG_HOME}"
mkdir -p "${HELM_DATA_HOME}"

if [[ -n "${DRY_RUN}" ]]; then
  printf "==> DRY RUN — render + server-side validate, no changes will be applied\n"
  helm_mode_flags=(--dry-run=server --debug)
else
  # Helm-version-aware flags:
  helm_major=$(helm version --template '{{.Version}}' | sed -E 's/^v?([0-9]+).*/\1/')
  if (( helm_major >= 4 )); then
    helm_mode_flags=(--rollback-on-failure --timeout 15m --force-conflicts)
  else
    helm_mode_flags=(--atomic --timeout 15m)
  fi
fi

helm version
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add postgresql-ha https://charts.bitnami.com/bitnami
helm repo add eks https://aws.github.io/eks-charts
helm dependency build  "${ROOT_DIR}/charts/openvsx"

printf "==> Running helm upgrade: release='%s' namespace='%s' image_tag='%s'\n" "${release_name}" "${namespace}" "${image_tag}"
helm upgrade --install "${release_name}" "${ROOT_DIR}/charts/openvsx" \
  -f "${values_file}" \
  --set image.tag="${image_tag}" \
  --namespace "${namespace}" \
  --create-namespace \
  "${helm_mode_flags[@]}"

if [[ -n "${DRY_RUN}" ]]; then
  printf "==> DRY RUN complete — no rollout to verify, exiting cleanly\n"
  exit 0
fi

printf "==> Verifying main app rollout: deployment/open-vsx-org-%s in namespace '%s'\n" "${deployment_env}" "${namespace}"
kubectl rollout status "deployment/open-vsx-org-${deployment_env}" --namespace "${namespace}" --timeout=5m
