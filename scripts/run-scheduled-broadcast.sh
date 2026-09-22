#!/bin/bash
# One-shot wrapper: runs the ZeptoMail broadcast, logs the result, then
# removes its own launchd job so it never fires again.
cd /Users/mac/thrive-conference || exit 1
/Users/mac/.nvm/versions/node/v20.20.2/bin/node scripts/send-skills-training-broadcast.js --send >> /Users/mac/thrive-conference/scripts/broadcast-log.txt 2>&1
echo "--- run finished at $(date) ---" >> /Users/mac/thrive-conference/scripts/broadcast-log.txt

UID_NUM=$(id -u)
launchctl bootout "gui/${UID_NUM}/com.thrive.skillstraining-broadcast" 2>/dev/null
rm -f "$HOME/Library/LaunchAgents/com.thrive.skillstraining-broadcast.plist"
