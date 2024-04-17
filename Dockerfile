ARG SERVER_VERSION=dbbaff4

# Builder image to compile the website
FROM ubuntu as builder

WORKDIR /workdir

RUN apt-get update \
  && apt-get install --no-install-recommends -y \
    bash \
    ca-certificates \
    curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# See https://github.com/nodesource/distributions/blob/main/README.md#debinstall
RUN curl -sSL https://deb.nodesource.com/setup_20.x | bash - \
  && apt-get install -y nodejs

RUN corepack enable
RUN corepack prepare yarn@stable --activate

# bump to update website
ENV WEBSITE_VERSION 0.11.6
COPY . /workdir

RUN /usr/bin/yarn --cwd website \
  && /usr/bin/yarn --cwd website compile \
  && /usr/bin/yarn --cwd website build

# Main image derived from openvsx-server
FROM ghcr.io/eclipse/openvsx-server:${SERVER_VERSION}
ARG SERVER_VERSION

COPY --from=builder --chown=openvsx:openvsx /workdir/website/static/ BOOT-INF/classes/static/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/ config/
COPY --from=builder --chown=openvsx:openvsx /workdir/logging/logback-spring.xml BOOT-INF/classes/

# Replace version placeholder with arg value
RUN sed -i "s/<SERVER_VERSION>/$SERVER_VERSION/g" config/application.yml