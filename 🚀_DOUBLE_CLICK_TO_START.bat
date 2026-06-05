@echo off
title DOW ELEF ERP SYSTEM - MAY 30, 2026
color 0A
cls
echo.
echo ╔════════════════════════════════════════════════════════════╗
echo ║                                                            ║
echo ║          DOW ELEF INTERNATIONAL (T) LTD                    ║
echo ║          ENTERPRISE ERP SYSTEM                             ║
echo ║          Updated: May 30, 2026                             ║
echo ║                                                            ║
echo ╚════════════════════════════════════════════════════════════╝
echo.
echo [NEW] CARGO VERIFICATION FORM IMPLEMENTED
echo       - Mandatory 10-point inspection before delivery
echo       - Digital form with print capability
echo       - Integrated into operations workflow
echo.
echo ============================================================
echo   ACCESS LINKS:
echo   - Local:   http://localhost:5173/
echo   - Network: http://192.168.0.114:5173/
echo ============================================================
echo.
echo   QUICK TEST CREDENTIALS:
echo   - Operation Clerk: clerk1@dowelef.com / password123
echo   - Finance Manager: finance@dowelef.com / password123
echo   - Declarant: declarant1@dowelef.com / password123
echo.
echo   ALL CREDENTIALS: See 🌐_ACCESS_LINKS_MAY_30_2026.txt
echo.
echo ============================================================
echo   BROWSER TIP: Press Ctrl+Shift+R for hard refresh
echo ============================================================
echo.
echo [INFO] Starting development server...
echo.
cd app
npm run dev -- --host
