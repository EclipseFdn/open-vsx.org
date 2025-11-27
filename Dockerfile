ARG SERVER_VERSION=c1e63f7
ARG SERVER_VERSION_STRING=v0.29.1-migration

# Builder image to compile the website
FROM ubuntu AS builder

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
  && corepack prepare yarn@stable --activate

# bump to update website
ENV WEBSITE_VERSION 0.16.4
COPY . /workdir

RUN /usr/bin/yarn --cwd website \
  && /usr/bin/yarn --cwd website compile \
  && /usr/bin/yarn --cwd website build

# Main image derived from openvsx-server
FROM ghcr.io/netomi/openvsx-server:${SERVER_VERSION}
ARG SERVER_VERSION
ARG SERVER_VERSION_STRING

COPY --from=builder --chown=openvsx:openvsx /workdir/website/static/ BOOT-INF/classes/static/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/application.yml config/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/logback-spring.xml BOOT-INF/classes/

# Replace version placeholder with arg value
RUN sed -i "s/<SERVER_VERSION>/${SERVER_VERSION_STRING}/g" config/application.yml
