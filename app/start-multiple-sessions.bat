@echo off
echo.
echo ========================================
echo   Starting 5 Development Servers
echo ========================================
echo.
echo Each server will run on a different port with isolated sessions:
echo   Session 1: http://localhost:5173
echo   Session 2: http://localhost:5174
echo   Session 3: http://localhost:5175
echo   Session 4: http://localhost:5176
echo   Session 5: http://localhost:5177
echo.
echo Press Ctrl+C to stop all servers
echo.

start "Dev Server 5173" cmd /k npm run dev:5173
timeout /t 3 /nobreak >nul

start "Dev Server 5174" cmd /k npm run dev:5174
timeout /t 3 /nobreak >nul

start "Dev Server 5175" cmd /k npm run dev:5175
timeout /t 3 /nobreak >nul

start "Dev Server 5176" cmd /k npm run dev:5176
timeout /t 3 /nobreak >nul

start "Dev Server 5177" cmd /k npm run dev:5177

echo.
echo ========================================
echo   All servers started!
echo ========================================
echo.
echo Server URLs:
echo   1. http://localhost:5173
echo   2. http://localhost:5174
echo   3. http://localhost:5175
echo   4. http://localhost:5176
echo   5. http://localhost:5177
echo.
echo Tip: Open each URL in a different browser window
echo      to test different user sessions simultaneously
echo.
pause
