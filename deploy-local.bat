@echo off
REM Dow Elef Shipment Management System - Local Deployment Script
REM This script will build and run the system locally

echo.
echo ========================================
echo  Dow Elef Shipment Management System
echo  Local Deployment Script
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "app\package.json" (
    echo [ERROR] Cannot find app\package.json
    echo Please run this script from the project root directory
    echo.
    pause
    exit /b 1
)

echo [1/4] Navigating to app directory...
cd app

echo [2/4] Installing dependencies...
call npm install
if errorlevel 1 (
    echo [ERROR] Failed to install dependencies
    cd ..
    pause
    exit /b 1
)

echo [3/4] Building the project...
call npm run build
if errorlevel 1 (
    echo [ERROR] Build failed
    cd ..
    pause
    exit /b 1
)

echo [4/4] Starting local server...
echo.
echo ========================================
echo  BUILD SUCCESSFUL!
echo ========================================
echo.
echo Your system is now running at:
echo.
echo    http://localhost:4173/
echo.
echo Test Accounts (password: password123):
echo    - doc.officer@dowelef.com
echo    - operations.manager@dowelef.com
echo    - operation.clerk@dowelef.com
echo.
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run preview

cd ..
