# Snapshot revision: ac65f1d
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

COPY --chown=openvsx:openvsx website/static/ BOOT-INF/classes/static/
