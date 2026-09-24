#!/bin/bash
# One-shot launchd wrapper for the Thrive Skills reminder email
# (scheduled for Fri Sept 25, 2026, 09:00 WAT = 01:00 on this Mac's PDT clock).
#
# Safeguards learned from the first scheduled send:
#  - waits for the network, since the Mac may just have woken from sleep
#  - a guard file makes it impossible to send twice (e.g. if launchd re-fires)
#  - refuses to send after the cutoff, because the email refers to "this Saturday"
# Set THRIVE_DRY_RUN=1 to exercise everything except the actual send.

DIR=/Users/mac/thrive-conference
LOG="$DIR/scripts/reminder-send.log"
GUARD="$DIR/scripts/.reminder-sent"
NODE=/Users/mac/.nvm/versions/node/v20.20.2/bin/node

cd "$DIR" || exit 1
echo "=== run started $(date) ===" >> "$LOG"

if [ -f "$GUARD" ]; then
  echo "already sent (guard file present); exiting" >> "$LOG"
  exit 0
fi

CUTOFF=$(date -u -j -f "%Y-%m-%d %H:%M" "2026-09-26 06:00" +%s)
if [ "$(date +%s)" -gt "$CUTOFF" ]; then
  echo "past cutoff (Sat Sept 26, 07:00 WAT); not sending" >> "$LOG"
  exit 0
fi

for i in $(seq 1 60); do
  curl -s -o /dev/null --max-time 10 https://www.googleapis.com && break
  echo "waiting for network ($i/60)" >> "$LOG"
  sleep 30
done

if [ -n "$THRIVE_DRY_RUN" ]; then MODE="--dry-run"; else MODE="--send"; fi
OUT=$("$NODE" scripts/send-skills-training-broadcast.js --reminder $MODE 2>&1)
echo "$OUT" >> "$LOG"

if [ -z "$THRIVE_DRY_RUN" ] && echo "$OUT" | grep -q "Sent to"; then
  touch "$GUARD"
fi
echo "=== run finished $(date) ===" >> "$LOG"
