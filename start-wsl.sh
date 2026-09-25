#!/usr/bin/env bash
# Kernel Base WSL Launcher script
export NO_AT_BRIDGE=1

USER_ID=$(id -u)
XDG_DIR="/run/user/$USER_ID"

# 1. Ensure user runtime socket directory exists if writable
if [ ! -d "$XDG_DIR" ]; then
  mkdir -p "/tmp/user-$USER_ID" 2>/dev/null || true
  chmod 700 "/tmp/user-$USER_ID" 2>/dev/null || true
  XDG_DIR="/tmp/user-$USER_ID"
fi

# 2. Auto-start session DBus daemon if missing
if [ ! -S "/run/user/$USER_ID/bus" ] && [ -z "$DBUS_SESSION_BUS_ADDRESS" ]; then
  if command -v dbus-launch >/dev/null 2>&1; then
    eval $(dbus-launch --sh-syntax --exit-with-session) 2>/dev/null
  elif command -v dbus-daemon >/dev/null 2>&1; then
    dbus-daemon --session --fork --address=unix:path=$XDG_DIR/bus 2>/dev/null || true
    export DBUS_SESSION_BUS_ADDRESS="unix:path=$XDG_DIR/bus"
  fi
fi

# 3. Fallback DBus address if still unset
if [ -z "$DBUS_SESSION_BUS_ADDRESS" ]; then
  if [ -S "/run/user/$USER_ID/bus" ]; then
    export DBUS_SESSION_BUS_ADDRESS="unix:path=/run/user/$USER_ID/bus"
  elif [ -S "/tmp/user-$USER_ID/bus" ]; then
    export DBUS_SESSION_BUS_ADDRESS="unix:path=/tmp/user-$USER_ID/bus"
  else
    export DBUS_SESSION_BUS_ADDRESS="disabled:"
  fi
fi

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

if [ -f "./out/kernel-base-linux-x64/kernel-base" ]; then
  echo "🚀 Launching Kernel Base packaged binary in WSL..."
  exec ./out/kernel-base-linux-x64/kernel-base --no-sandbox --disable-gpu --disable-dev-shm-usage "$@"
else
  echo "⚡ Launching Kernel Base dev runner..."
  npm run dev:wsl
fi
