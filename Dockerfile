# Snapshot revision: 0779dd5
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

ADD website/static/* BOOT-INF/classes/static/
