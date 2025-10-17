@echo off
echo ========================================
echo Stopping FleetFlow Application
echo ========================================
echo.

echo Killing all Node.js processes...
taskkill /F /IM node.exe

echo.
echo ========================================
echo All servers stopped!
echo ========================================
echo.
pause
