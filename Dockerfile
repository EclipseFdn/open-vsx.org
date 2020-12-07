FROM ghcr.io/eclipse/openvsx-server:5771b29

COPY --chown=openvsx:openvsx website/static/ BOOT-INF/classes/static/
COPY --chown=openvsx:openvsx configuration/ config/
