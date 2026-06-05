# Force restart the development server
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "FORCE RESTARTING DEVELOPMENT SERVER" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill all node processes
Write-Host "Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Navigate to app directory
Set-Location -Path "app"

# Clear Vite cache
Write-Host "Clearing Vite cache..." -ForegroundColor Yellow
if (Test-Path "node_modules/.vite") {
    Remove-Item -Path "node_modules/.vite" -Recurse -Force
    Write-Host "Vite cache cleared!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "Please wait for the server to start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Once you see 'Local: http://localhost:5173/' you can:" -ForegroundColor Cyan
Write-Host "1. Open your browser to http://localhost:5173/" -ForegroundColor White
Write-Host "2. Press Ctrl+F5 to hard refresh" -ForegroundColor White
Write-Host "3. Login as: finance_manager@company.com / finance_manager123" -ForegroundColor White
Write-Host "4. Look for 'Fixed Assets' and 'Inventory' in the sidebar" -ForegroundColor White
Write-Host ""
Write-Host "Press Ctrl+C to stop the server when done" -ForegroundColor Yellow
Write-Host ""

# Start the dev server
npm run dev
