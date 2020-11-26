# Snapshot revision: ec62061
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

COPY --chown=openvsx:openvsx website/static/ BOOT-INF/classes/static/
