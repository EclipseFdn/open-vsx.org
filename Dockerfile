FROM ghcr.io/eclipse/openvsx-server:bcf243b

COPY --chown=openvsx:openvsx website/static/ BOOT-INF/classes/static/
COPY --chown=openvsx:openvsx configuration/ config/
