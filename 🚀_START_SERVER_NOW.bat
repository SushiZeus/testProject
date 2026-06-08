@echo off
title DOW ELEF ERP SYSTEM - SERVER STARTING...
color 0A
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          DOW ELEF INTERNATIONAL (T) LTD                    ║
echo ║          ENTERPRISE ERP SYSTEM                             ║
echo ║          Version 1.2.1 - June 5, 2026                      ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo [INFO] Starting Development Server...
echo.
echo ============================================================
echo   SERVER WILL BE AVAILABLE AT:
echo   - Local:   http://localhost:5173/
echo   - Network: http://192.168.0.114:5173/
echo ============================================================
echo.
echo [TIP] Press Ctrl+C to stop the server
echo [TIP] Hard refresh browser: Ctrl + Shift + R
echo.
echo ============================================================
echo   LATEST UPDATES:
echo   • Cargo Verification Form
echo   • Declaration Done Button Fix
echo   • Port 5173 (Updated)
echo ============================================================
echo.

cd /d "%~dp0app"
npm run dev -- --host

pause
