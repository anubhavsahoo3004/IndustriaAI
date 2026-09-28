#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cd "$PROJECT_DIR" || exit 1

export PATH="/opt/homebrew/bin:/usr/local/bin:$PATH"

echo "Starting IndustriaAI..."

# Start backend
echo "Starting backend..."
"$PROJECT_DIR/backend/venv/bin/uvicorn" backend.app.main:app \
  --host 127.0.0.1 \
  --port 8000 > backend.log 2>&1 &

BACKEND_PID=$!

# Give backend a moment
sleep 2

# Start frontend
echo "Starting frontend..."
cd "$PROJECT_DIR/frontend" || exit 1

npm run dev -- --host 127.0.0.1 --port 5173

# When frontend stops, stop backend too
kill $BACKEND_PID 2>/dev/null
