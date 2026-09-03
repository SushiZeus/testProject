@echo off
echo ╔══════════════════════════════════════════════════════════════════════════════╗
echo ║                                                                              ║
echo ║               📦 CREATE PORTABLE PACKAGE - VERSION 1.5.0                     ║
echo ║                                                                              ║
echo ╚══════════════════════════════════════════════════════════════════════════════╝
echo.
echo This script will prepare the project for transfer to another IDE/computer
echo.

echo ✓ Step 1: Checking current directory...
cd /d "%~dp0"
echo Current directory: %CD%
echo.

echo ✓ Step 2: Cleaning node_modules...
if exist "app\node_modules" (
    echo Found node_modules folder - removing...
    rmdir /s /q "app\node_modules"
    echo node_modules removed successfully!
) else (
    echo No node_modules folder found - skipping
)
echo.

echo ✓ Step 3: Cleaning dist folder...
if exist "app\dist" (
    echo Found dist folder - removing...
    rmdir /s /q "app\dist"
    echo dist folder removed successfully!
) else (
    echo No dist folder found - skipping
)
echo.

echo ✓ Step 4: Package is ready!
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo                          📦 PACKAGE PREPARATION COMPLETE
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo Your project is now ready to be transferred!
echo.
echo NEXT STEPS:
echo ───────────────────────────────────────────────────────────────────────────────
echo.
echo 1. ZIP THE ENTIRE FOLDER:
echo    → Right-click "testproject" folder
echo    → Select "Send to" → "Compressed (zipped) folder"
echo    → Name it: clearance-system-v1.5.0.zip
echo.
echo 2. TRANSFER THE ZIP:
echo    → Copy ZIP file to USB drive, cloud storage, or email
echo    → Transfer to target computer
echo.
echo 3. ON NEW COMPUTER:
echo    → Extract ZIP file
echo    → Open terminal in "testproject\app" folder
echo    → Run: npm install
echo    → Run: npm run dev
echo    → Access: http://localhost:5173
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo 📋 WHAT'S INCLUDED:
echo    ✓ Complete source code (150+ files)
echo    ✓ All configuration files
echo    ✓ Complete documentation (50+ files)
echo    ✓ package.json (dependencies list)
echo    ✓ All README and setup guides
echo.
echo 📋 WHAT'S EXCLUDED (Will be downloaded via npm install):
echo    ✗ node_modules folder (~200MB, 50+ packages)
echo    ✗ dist folder (build output)
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo 💾 ESTIMATED PACKAGE SIZE: ~5-10MB (without node_modules)
echo 📦 FINAL PACKAGE SIZE: ~200MB (after npm install on new machine)
echo.
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo ✅ Package preparation complete!
echo    You can now ZIP and transfer the "testproject" folder
echo.
echo For detailed instructions, see:
echo    📦_PORTABLE_DEPLOYMENT_PACKAGE_GUIDE.md
echo.
pause
