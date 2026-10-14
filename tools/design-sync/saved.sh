#!/bin/sh
# usage: saved.sh  -> latest saved revision of the qui Penpot file (compare before/after a build to prove it persisted)
ssh ranu@192.168.0.104 'docker exec compose-hack-solid-state-sensor-19p4dq-penpot-postgres-1 psql -U penpot -d penpot -At -c "select revn, created_at from file_change where file_id=\$\$a9173937-72c5-8185-8008-bbfb2e5c878d\$\$ order by revn desc limit 1;"; date -u +%H:%M:%S'
