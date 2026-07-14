#!/bin/bash
set -e

echo "=== Soroban Guard VS Code Extension Build ==="
echo ""

echo "[1/4] Installing dependencies..."
npm install

echo ""
echo "[2/4] Compiling extension..."
npm run compile

echo ""
echo "[3/4] Running linter..."
npm run lint

echo ""
echo "[4/4] Running tests..."
npm run test

echo ""
echo "=== Build complete ==="
