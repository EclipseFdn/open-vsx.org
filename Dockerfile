FROM ghcr.io/eclipse/openvsx-server:7d04e73

COPY --chown=openvsx:openvsx website/static/ BOOT-INF/classes/static/
COPY --chown=openvsx:openvsx configuration/ config/
