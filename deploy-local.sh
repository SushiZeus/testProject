#!/bin/bash

# Dow Elef Shipment Management System - Local Deployment Script
# This script will build and run the system locally

echo ""
echo "========================================"
echo " Dow Elef Shipment Management System"
echo " Local Deployment Script"
echo "========================================"
echo ""

# Check if we're in the right directory
if [ ! -f "app/package.json" ]; then
    echo "[ERROR] Cannot find app/package.json"
    echo "Please run this script from the project root directory"
    echo ""
    exit 1
fi

echo "[1/4] Navigating to app directory..."
cd app

echo "[2/4] Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
    echo "[ERROR] Failed to install dependencies"
    cd ..
    exit 1
fi

echo "[3/4] Building the project..."
npm run build
if [ $? -ne 0 ]; then
    echo "[ERROR] Build failed"
    cd ..
    exit 1
fi

echo "[4/4] Starting local server..."
echo ""
echo "========================================"
echo " BUILD SUCCESSFUL!"
echo "========================================"
echo ""
echo "Your system is now running at:"
echo ""
echo "   http://localhost:4173/"
echo ""
echo "Test Accounts (password: password123):"
echo "   - doc.officer@dowelef.com"
echo "   - operations.manager@dowelef.com"
echo "   - operation.clerk@dowelef.com"
echo ""
echo "Press Ctrl+C to stop the server"
echo "========================================"
echo ""

npm run preview

cd ..
