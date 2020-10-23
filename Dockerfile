# Snapshot revision: 303e4ee
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

ADD website/static/* BOOT-INF/classes/static/
