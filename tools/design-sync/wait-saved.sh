#!/bin/sh
# usage: wait-saved.sh <revn-before> [seconds]  -> blocks until Penpot has saved a newer revision (it only saves while the tab is idle)
B=${1:-0}; T=${2:-90}; i=0
while [ $i -lt $T ]; do r=$(./saved.sh | head -1 | cut -d'|' -f1); if [ "$r" -gt "$B" ]; then echo "saved revn $r after ${i}s"; exit 0; fi; sleep 3; i=$((i+3)); done
echo "NOT saved after ${T}s (still $r)"; exit 1
