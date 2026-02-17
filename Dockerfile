ARG SERVER_VERSION=v0.32.0
ARG SERVER_VERSION_STRING=v0.32.0

# Builder image to compile the website
FROM ubuntu:24.04 AS builder

WORKDIR /workdir

# See https://github.com/nodesource/distributions for Node.js package
RUN apt-get update \
  && apt-get install --no-install-recommends -y \
    bash \
    ca-certificates \
    curl \
  && rm -rf /var/lib/apt/lists/* \
  && curl -sSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs \
  && apt-get clean \
  && corepack enable \
  && corepack prepare yarn@4.9.1 --activate

# bump to update website
COPY . /workdir

RUN cd website \
  && yarn install --immutable \
  && yarn compile \
  && yarn build

# Main image derived from openvsx-server
FROM ghcr.io/eclipse/openvsx-server:${SERVER_VERSION}
ARG SERVER_VERSION
ARG SERVER_VERSION_STRING

COPY --from=builder --chown=openvsx:openvsx /workdir/website/static/ BOOT-INF/classes/static/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/application.yml config/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/logback-spring.xml BOOT-INF/classes/
COPY --from=builder --chown=openvsx:openvsx /workdir/mail-templates BOOT-INF/classes/mail-templates

# Replace version placeholder with arg value
RUN sed -i "s/<SERVER_VERSION>/${SERVER_VERSION_STRING}/g" config/application.yml
