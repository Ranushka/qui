#!/bin/sh
# usage: push.sh <local-file> <name.js>  -> https://penpot.ranu.win/qui-tmp/<name.js> (static .js is served as-is)
F=compose-hack-solid-state-sensor-19p4dq-penpot-frontend-1
cat "$1" | ssh ranu@192.168.0.104 "docker exec -i $F sh -c 'mkdir -p /var/www/app/qui-tmp && cat > /var/www/app/qui-tmp/$2'"
