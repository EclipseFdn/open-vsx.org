# Kubernetes Deployment Guide

This directory contains Kubernetes deployment configurations and Helm charts for Open VSX.

## Prerequisites

Before deploying, ensure you have:

* Bash 4 or higher
* [Helm 3.x](https://helm.sh/) installed and configured
* `kubectl` configured with access to your Kubernetes cluster
* Appropriate cluster permissions (see RBAC setup below)

## Deployment Environments

Open VSX supports three deployment environments:

| Environment | Namespace | Release Name | Values File |
|-------------|-----------|--------------|-------------|
| Test | `open-vsx-org-test` | `test` | `values-test.yaml` |
| Staging | `open-vsx-org-staging` | `staging` | `values-staging.yaml` |
| Production | `open-vsx-org` | `production` | `values.yaml` |

## Deploying to Staging

Deploy a specific Docker image to the staging environment:

```bash
./helm-deploy.sh staging <docker_image_tag>
```

Example:
```bash
./helm-deploy.sh staging de4f2c
```

## Deploying to Production

Deploy a specific Docker image to the production environment:

```bash
./helm-deploy.sh production <docker_image_tag>
```

Example:
```bash
./helm-deploy.sh production de4f2c
```

## Deploying to Test

Deploy a specific Docker image to the test environment:

```bash
./helm-deploy.sh test <docker_image_tag>
```

## RBAC Setup for Jenkins (JIRO)

Since Eclipse Foundation [JIRO](https://foundation.eclipse.org/ci/infra/job/open-vsx.org) runs with a specific service account, cluster roles must be configured to allow Jenkins to deploy:

```bash
kubectl apply -f clusterroles.yaml
```

This creates the necessary RBAC permissions for automated deployments.

## Helm Chart Configuration

The Helm chart is located in `../charts/openvsx/` and includes:

- **Chart.yaml**: Chart metadata and version
- **values.yaml**: Production configuration (default)
- **values-staging.yaml**: Staging-specific overrides
- **values-test.yaml**: Test-specific overrides
- **templates/**: Kubernetes resource templates

### Key Configuration Options

- `replicaCount`: Number of application replicas (default: 6 for production)
- `image.tag`: Docker image tag to deploy
- `resources`: CPU and memory limits/requests
- `website.jvmArgs`: JVM configuration for the Spring Boot application

## Troubleshooting

### Deployment fails with permission errors

Ensure RBAC is configured:
```bash
kubectl apply -f clusterroles.yaml
```

### Image pull errors

Verify the image tag exists at [ghcr.io/eclipsefdn/openvsx-website](https://github.com/orgs/EclipseFdn/packages/container/package/openvsx-website).

### Checking deployment status

```bash
kubectl get pods -n <namespace>
kubectl logs -n <namespace> <pod-name>
```

### Rolling back a deployment

```bash
helm rollback <release-name> -n <namespace>
```

## Additional Resources

- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Eclipse Foundation JIRO](https://foundation.eclipse.org/ci/infra/)
