# Snapshot revision: 2dd793d
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

ADD website/static/* BOOT-INF/classes/static/
