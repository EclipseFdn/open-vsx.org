# Republishes the combined server+website image built and pushed by
# EclipseFdn/openvsx-ef (github.com/EclipseFdn/openvsx-ef, workflow
# .github/workflows/docker-build.yml) under the ghcr.io/eclipsefdn/openvsx-website
# name this repo's Jenkins pipeline and Helm chart already expect. That image
# already contains the built website, the upstream openvsx server, and this
# module's configuration/mail-templates - nothing left to build here.
#
# bump to deploy a newer openvsx-ef build
ARG WEBSITE_IMAGE_TAG=2c738c2

FROM ghcr.io/eclipsefdn/openvsx-website-snapshot:${WEBSITE_IMAGE_TAG}
