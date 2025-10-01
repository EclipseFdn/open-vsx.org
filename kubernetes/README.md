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

## Dependencies

* bash 4
* [Helm](https://https://helm.sh/)
