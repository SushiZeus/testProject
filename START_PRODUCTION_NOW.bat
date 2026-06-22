@echo off
echo ═══════════════════════════════════════════════════════════════════════════════
echo    STARTING PRODUCTION SERVER - JUNE 23, 2026
echo ═══════════════════════════════════════════════════════════════════════════════
echo.
echo Version: 1.3.2
echo Port: 5173
echo Network: http://192.168.0.114:5173/
echo.
echo Starting server with network access...
echo.

cd app
npm run dev -- --host

pause
