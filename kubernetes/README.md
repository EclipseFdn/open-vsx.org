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

`aws-staging` stores extension analytics in an in-cluster `timescaledb-single` release deployed as
a subchart. The `admin` role and the `openvsx_analytics` database are created by the post-init
scripts in `charts/openvsx/templates/timescaledb-analytics-init.yaml`.

### Rotating the analytics database password

The post-init scripts run **once**, when Patroni bootstraps a fresh cluster. `openvsx/<env>/analytics-timescaledb`
in Secrets Manager is the source of truth for the password, but rotating it there only updates the
Kubernetes Secret and the value the application connects with — the database keeps the old
password, and the app then fails password auth on startup. Change the database first:

1. Set the new password on the role, from inside the primary pod:

   ```bash
   kubectl exec -n open-vsx-org-staging -it staging-analytics-timescaledb-0 -c timescaledb -- \
     psql -U postgres
   ```

   then, at the prompt:

   ```
   \password admin
   ```

   Use `\password` rather than a hand-written `ALTER ROLE ... PASSWORD`: it hashes the password
   client-side, so only the SCRAM verifier reaches the server, and it suppresses statement logging
   around the `ALTER ROLE` it issues. A hand-written one would be written verbatim to the pod log,
   since the cluster runs with `log_statement = 'ddl'` and `ALTER ROLE` is DDL.

2. Store the same value under the `admin-password` property of
   `openvsx/<env>/analytics-timescaledb` in Secrets Manager.

3. Wait for External Secrets to refresh `<env>-analytics-timescaledb-credentials` (the
   `externalSecrets.refreshInterval` in the values file), then restart the application so it picks
   up the new value — it is injected as an environment variable at pod start:

   ```bash
   kubectl rollout restart -n open-vsx-org-staging deployment/open-vsx-org-staging
   ```

Rotating the `superuser-password` or `replication-password` properties is a Patroni concern and
needs the [timescaledb-single credentials procedure](https://github.com/timescale/helm-charts/blob/main/charts/timescaledb-single/admin-guide.md),
not this one.

## Dependencies

* bash 4
* [Helm](https://https://helm.sh/)
