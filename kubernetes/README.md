## How to deploy staging instance for a given image tag?

```bash
./gen-deployment.sh staging <imagetag> | kubectl apply -f -
```

## How to deploy production instance for a given image tag?

```bash
./gen-deployment.sh production <imagetag> | kubectl apply -f -
```

## Dependencies

* bash 4
* [jsonnet](https://jsonnet.org)