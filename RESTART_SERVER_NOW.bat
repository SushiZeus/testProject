@echo off
echo ========================================
echo RESTARTING DEVELOPMENT SERVER
echo ========================================
echo.
echo This will restart the server to load all new modules...
echo.

cd app

echo Stopping any running servers...
taskkill /F /IM node.exe 2>nul

echo.
echo Starting development server...
echo.
echo The server will start in a few seconds...
echo Once you see "Local: http://localhost:5173/" you can access the app
echo.
echo Press Ctrl+C to stop the server when done
echo.

npm run dev

pause
