@echo off
echo ========================================
echo Starting FleetFlow Application
echo ========================================
echo.

REM Kill any existing node processes
echo Cleaning up existing processes...
taskkill /F /IM node.exe >nul 2>&1

REM Wait for ports to clear
echo Waiting for ports to clear...
timeout /t 5 /nobreak >nul

echo.
echo Starting Backend Server (Port 5000)...
start "FleetFlow Backend - Port 5000" cmd /k "cd /d %~dp0backend && npm run dev"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server (Port 3000)...
start "FleetFlow Frontend - Port 3000" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo Servers are starting in separate windows...
echo Backend: http://localhost:5000
echo Frontend: http://localhost:3000
echo ========================================
echo.
echo You can now close this window.
echo The servers will continue running in their own windows.
echo.
pause
