# Snapshot revision: 0a300db
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

ADD website/static/* BOOT-INF/classes/static/
