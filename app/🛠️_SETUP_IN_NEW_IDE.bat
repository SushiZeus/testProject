@echo off
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║                  🛠️ SETUP IN NEW IDE - VERSION 1.5.0                        ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo This script will set up the project in your new IDE/computer
echo.

cd /d "%~dp0"

echo ✓ Step 1: Checking Node.js installation...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo Required version: 18.0.0 or higher
    echo.
    pause
    exit /b 1
)

echo Node.js found!
node --version
echo.

echo ✓ Step 2: Checking npm installation...
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: npm is not installed!
    echo Please reinstall Node.js from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo npm found!
npm --version
echo.

echo ✓ Step 3: Installing dependencies...
echo This may take 2-5 minutes depending on your internet speed...
echo.

npm install

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ ERROR: Failed to install dependencies!
    echo.
    echo Try these solutions:
    echo 1. Check your internet connection
    echo 2. Delete node_modules and package-lock.json
    echo 3. Run: npm cache clean --force
    echo 4. Run this script again
    echo.
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo                          ✅ SETUP COMPLETE!
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo Your development environment is ready!
echo.
echo 🚀 TO START THE SERVER:
echo ───────────────────────────────────────────────────────────────────────────────
echo.
echo    npm run dev
echo.
echo    The server will start on: http://localhost:5173
echo.
echo 🌐 TO ACCESS THE SYSTEM:
echo ───────────────────────────────────────────────────────────────────────────────
echo.
echo    1. Open browser: http://localhost:5173
echo    2. Login with:
echo       Username: admin
echo       Password: password123
echo.
echo 📖 DOCUMENTATION:
echo ───────────────────────────────────────────────────────────────────────────────
echo.
echo    See parent folder for complete documentation:
echo    - 🌟_READ_ME_FIRST_JULY_1_2026.txt
echo    - 📍_COMPLETE_SYSTEM_RESOURCES_JULY_1_2026.txt
echo    - 📦_PORTABLE_DEPLOYMENT_PACKAGE_GUIDE.md
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo Would you like to start the server now? (Y/N)
set /p START_NOW=
if /i "%START_NOW%"=="Y" (
    echo.
    echo Starting development server...
    echo Press Ctrl+C to stop the server
    echo.
    npm run dev
) else (
    echo.
    echo Setup complete! Run "npm run dev" when ready to start.
    echo.
    pause
)
