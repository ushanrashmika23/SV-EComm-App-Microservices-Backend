#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVICES_DIR="$ROOT_DIR/services"
LOG_DIR="$ROOT_DIR/.service-logs"

mkdir -p "$LOG_DIR"

if [[ ! -d "$SERVICES_DIR" ]]; then
  echo "[ERROR] Services directory not found: $SERVICES_DIR"
  exit 1
fi

PIDS=()
NAMES=()
CLEANED_UP=0

has_npm_script() {
  local dir="$1"
  local script_name="$2"

  node -e '
    const fs = require("fs");
    const path = process.argv[1];
    const scriptName = process.argv[2];
    const pkg = JSON.parse(fs.readFileSync(path, "utf8"));
    process.exit(pkg.scripts && pkg.scripts[scriptName] ? 0 : 1);
  ' "$dir/package.json" "$script_name" >/dev/null 2>&1
}

resolve_command() {
  local dir="$1"

  if has_npm_script "$dir" "dev"; then
    echo "npm run dev"
    return
  fi

  if has_npm_script "$dir" "start"; then
    echo "npm start"
    return
  fi

  if [[ -f "$dir/index.js" ]]; then
    echo "node index.js"
    return
  fi

  if [[ -f "$dir/server.js" ]]; then
    echo "node server.js"
    return
  fi

  echo ""
}

cleanup() {
  if [[ "$CLEANED_UP" -eq 1 ]]; then
    return
  fi

  CLEANED_UP=1

  if [[ "${#PIDS[@]}" -eq 0 ]]; then
    return
  fi

  echo
  echo "Stopping all services..."

  for pid in "${PIDS[@]}"; do
    if kill -0 "$pid" >/dev/null 2>&1; then
      kill "$pid" >/dev/null 2>&1 || true
    fi
  done

  for pid in "${PIDS[@]}"; do
    wait "$pid" 2>/dev/null || true
  done

  echo "All services stopped."
}

trap cleanup INT TERM EXIT

echo "Starting all services from: $SERVICES_DIR"
echo "Logs: $LOG_DIR"

while IFS= read -r -d '' package_file; do
  service_dir="$(dirname "$package_file")"
  service_name="$(basename "$service_dir")"
  log_file="$LOG_DIR/$service_name.log"

  command="$(resolve_command "$service_dir")"

  if [[ -z "$command" ]]; then
    echo "[SKIP] $service_name (no runnable command found)"
    continue
  fi

  (
    cd "$service_dir"
    bash -lc "$command"
  ) >"$log_file" 2>&1 &

  pid=$!
  PIDS+=("$pid")
  NAMES+=("$service_name")

  echo "[STARTED] $service_name (pid=$pid) -> $command"
  echo "          log: $log_file"
done < <(find "$SERVICES_DIR" -mindepth 2 -maxdepth 2 -name package.json -print0 | sort -z)

if [[ "${#PIDS[@]}" -eq 0 ]]; then
  echo "No runnable services found."
  exit 1
fi

echo
printf '%s\n' "Running ${#PIDS[@]} services. Press Ctrl+C to stop all."

wait
