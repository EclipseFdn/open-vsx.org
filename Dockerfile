# Builder image to compile the website
FROM ubuntu:focal as builder

WORKDIR /workdir

RUN apt-get update \
  && apt-get install --no-install-recommends -y \
    bash \
    ca-certificates \
    curl \
  && apt-get clean \
  && rm -rf /var/lib/apt/lists/*

# See https://github.com/nodesource/distributions/blob/main/README.md#debinstall
RUN curl -sSL https://deb.nodesource.com/setup_12.x | bash - \
  && apt-get install -y nodejs

RUN npm install --global yarn@1.*

# bump to update website
ENV WEBSITE_VERSION 0.2.0-next.19286bf
COPY . /workdir

RUN /usr/bin/yarn --cwd website \
  && /usr/bin/yarn --cwd website build

# Main image derived from openvsx-server
FROM docker.io/amvanbaren/openvsx-server:b386833

COPY --from=builder --chown=openvsx:openvsx /workdir/website/static/ BOOT-INF/classes/static/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/ config/
