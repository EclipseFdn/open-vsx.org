# Snapshot revision: 93e31b9
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

COPY --chown=openvsx:openvsx website/static/ BOOT-INF/classes/static/
