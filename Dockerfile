# Snapshot revision: 498be4a
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

COPY --chown=openvsx:openvsx website/static/ BOOT-INF/classes/static/
