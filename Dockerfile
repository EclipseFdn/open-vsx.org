ARG SERVER_VERSION=poc/eclipse-extraction
ARG SERVER_VERSION_STRING=v1.1.0-dev.3

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
  && yarn build

# Upstream server sources at the ref given by SERVER_VERSION, consumed as a library
# by the Gradle build stage below. To build from a local checkout instead of cloning
# (e.g. the 'upstream' submodule or a sibling working copy):
#   docker build --build-context server-src=server/upstream .
FROM alpine/git:latest AS server-clone
ARG SERVER_REPO=https://github.com/gnugomez/openvsx.git
ARG SERVER_VERSION
RUN git clone --filter=blob:none ${SERVER_REPO} /src \
  && git -C /src checkout ${SERVER_VERSION}

FROM scratch AS server-src
COPY --from=server-clone /src /

# Build the server application against the upstream library (composite build)
FROM eclipse-temurin:25-jdk AS server-builder

WORKDIR /workdir

COPY --from=server-src / upstream/
COPY server/gradlew server/settings.gradle server/build.gradle ./
COPY server/gradle/ gradle/
COPY server/src/ src/

ENV CI=true

RUN ./gradlew --no-daemon -PopenvsxServerPath=upstream/server bootJar \
  && mkdir exploded \
  && cd exploded \
  && jar -xf ../build/libs/openvsx-server.jar

# Main image: plain JRE plus the exploded server archive, replicating the layout of
# the upstream-derived image this used to build FROM
FROM eclipse-temurin:25-jre
ARG SERVER_VERSION_STRING

# Create user openvsx and set up home directory
RUN groupadd -r openvsx \
    && useradd --no-log-init -r -g openvsx openvsx \
    && mkdir -p /home/openvsx/server \
    && chown -R openvsx:openvsx /home/openvsx

USER openvsx
WORKDIR /home/openvsx/server

COPY --chown=openvsx:openvsx --from=server-builder /workdir/exploded/ ./
COPY --chown=openvsx:openvsx --from=server-src /server/scripts/run-server.sh ./

COPY --from=builder --chown=openvsx:openvsx /workdir/website/dist/ BOOT-INF/classes/static/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/application.yml config/
COPY --from=builder --chown=openvsx:openvsx /workdir/configuration/logback-spring.xml BOOT-INF/classes/
COPY --from=builder --chown=openvsx:openvsx /workdir/mail-templates BOOT-INF/classes/mail-templates

# Replace version placeholder with arg value; make the start script executable
RUN chmod u+x run-server.sh \
  && sed -i "s/<SERVER_VERSION>/${SERVER_VERSION_STRING}/g" config/application.yml

ENTRYPOINT ["./run-server.sh"]
