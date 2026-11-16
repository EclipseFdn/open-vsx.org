#!/usr/bin/env bash

#*******************************************************************************
# Copyright (c) 2024 Eclipse Foundation and others.
# This program and the accompanying materials are made available
# under the terms of the Eclipse Public License 2.0
# which is available at http://www.eclipse.org/legal/epl-v20.html
# SPDX-License-Identifier: EPL-2.0
#*******************************************************************************

# Fetches the openvsx chart's subchart dependencies into charts/openvsx/charts/.
# Called by helm-deploy.sh, or run once up front (then SKIP_HELM_DEPS=1 helm-deploy.sh ...)
# when several deploys share one workspace in parallel, so they don't all rewrite
# the same charts/ dir and Helm repo cache concurrently.

# Bash strict-mode
set -o errexit
set -o nounset
set -o pipefail

IFS=$'\n\t'
SCRIPT_FOLDER="$(dirname "$(readlink -f "${0}")")"
ROOT_DIR="${SCRIPT_FOLDER}/.."

# Must match the paths helm-deploy.sh exports.
export HELM_CACHE_HOME="${ROOT_DIR}/.helm/cache"
export HELM_CONFIG_HOME="${ROOT_DIR}/.helm/config"
export HELM_DATA_HOME="${ROOT_DIR}/.helm/data"

mkdir -p "${HELM_CACHE_HOME}"
mkdir -p "${HELM_CONFIG_HOME}"
mkdir -p "${HELM_DATA_HOME}"

helm version
helm repo add grafana https://grafana.github.io/helm-charts
helm repo add postgresql-ha https://charts.bitnami.com/bitnami
helm repo add eks https://aws.github.io/eks-charts
helm dependency build  "${ROOT_DIR}/charts/openvsx"
