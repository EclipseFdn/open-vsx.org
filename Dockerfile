# Snapshot revision: eae9836
FROM docker.pkg.github.com/eclipse/openvsx/openvsx-server:snapshot

ADD website/static/* BOOT-INF/classes/static/
