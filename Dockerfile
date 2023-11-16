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
ENV WEBSITE_VERSION 0.11.1
COPY . /workdir

RUN /usr/bin/yarn --cwd website \
  && /usr/bin/yarn --cwd website compile \
  && /usr/bin/yarn --cwd website build

# Main image derived from openvsx-server 
FROM ghcr.io/eclipse/openvsx-server:v0.14.0

COPY --from=builder --chown=openvsx:openvsx /workdir/website/static/ BOOT-INF/classes/static/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/ config/
