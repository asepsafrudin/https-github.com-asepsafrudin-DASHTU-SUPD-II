#!/bin/bash
cd /home/aseps/MCP/workspace/DASHTU-SUPD-II
source .venv/bin/activate

echo "Memulai daemon FastAPI..."
while true; do
  uvicorn api.main:app --reload --host 0.0.0.0 --port 8003
  EXIT_CODE=$?
  echo "⚠️ FastAPI Server berhenti (Exit Code: $EXIT_CODE). Memulai ulang dalam 2 detik..."
  sleep 2
done
