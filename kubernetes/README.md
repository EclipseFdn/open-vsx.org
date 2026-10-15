## How to deploy aws-staging instance for a given image?

```bash
./helm-deploy.sh aws-staging <docker_image_tag>
```

## How to deploy staging instance for a given image?

```bash
./helm-deploy.sh staging <docker_image_tag>
```

Where `<docker_image_tag>` can be de4f2c
## How to deploy production instance for a given image?

```bash
./helm-deploy.sh production <docker_image_tag>
```

Where `<docker_image_tag>` can be de4f2c

## Preparing for EF JIRO specific environment
Since EF [JIRO](https://foundation.eclipse.org/ci/infra/job/open-vsx.org) runs with specific user, `clusterroles.yaml` has been added to allow jenkins to deploy environment. Resources need to be added with:

```bash
kubectl apply -f clusterroles.yaml
```

## Analytics (TimescaleDB)

`aws-staging` stores extension analytics in an in-cluster CloudNativePG cluster with TimescaleDB
(`charts/openvsx/templates/analytics-cnpg.yaml`). The `admin` role and the `openvsx_analytics`
database are created by the cluster's bootstrap.

### Rotating the analytics database password

`openvsx/<env>/analytics-timescaledb` (property `admin-password`) in Secrets Manager is the source
of truth for the analytics password. Rotating it there only updates the Kubernetes Secret and the
value the application connects with; the database keeps the old password until the role is changed,
and the app's analytics calls then fail password auth. Change the database first:

1. Set the new password on the role, from inside the CloudNativePG primary:

   ```bash
   P=$(kubectl get cluster.postgresql.cnpg.io -n open-vsx-org-staging staging-analytics \
     -o jsonpath='{.status.currentPrimary}')
   kubectl exec -n open-vsx-org-staging -it "$P" -c postgres -- psql
   ```

   then, at the prompt:

   ```
   \password admin
   ```

   Use `\password` rather than a hand-written `ALTER ROLE ... PASSWORD`: it hashes the password
   client-side, so only the SCRAM verifier reaches the server and nothing readable ends up in logs.

2. Store the same value under the `admin-password` property of
   `openvsx/<env>/analytics-timescaledb` in Secrets Manager.

3. Wait for External Secrets to refresh `<env>-analytics-app` (the `externalSecrets.refreshInterval`
   in the values file), then restart the application so it picks up the new value — it is injected
   as an environment variable at pod start:

   ```bash
   kubectl rollout restart -n open-vsx-org-staging deployment/open-vsx-org-staging
   ```

## Dependencies

* bash 4
* [Helm](https://https://helm.sh/)
