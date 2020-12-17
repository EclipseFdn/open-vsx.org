## How to deploy staging instance for a given image?

```bash
./gen-deployment.sh staging <image> | kubectl apply -f -
```

Where `<image>` can be ghcr.io/eclipsefdn/openvsx-website:de4f2c
## How to deploy production instance for a given image?

```bash
./gen-deployment.sh production <image> | kubectl apply -f -
```

Where `<image>` can be ghcr.io/eclipsefdn/openvsx-website:de4f2c

## Dependencies

* bash 4
* [jsonnet](https://jsonnet.org)