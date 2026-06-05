@echo off
echo ========================================
echo DOW ELEF ERP SYSTEM - AUTO START
echo ========================================
echo.
echo Starting development server...
echo.
cd app
start cmd /k "npm run dev"
echo.
echo Server is starting in a new window!
echo.
echo Access your system at: http://localhost:5173
echo.
echo Login: admin / administrator123
echo.
echo ========================================
pause
