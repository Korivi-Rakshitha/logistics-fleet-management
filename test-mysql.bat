@echo off
echo ========================================
echo    TESTING MYSQL CONNECTION
echo ========================================
echo.

echo Testing MySQL connection with password: Rakshitha@11
echo.

mysql -u root -pRakshitha@11 -e "SELECT 'MySQL Connection Successful!' as Status; SHOW DATABASES;"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] MySQL connection works!
    echo.
    echo Now creating database if it doesn't exist...
    mysql -u root -pRakshitha@11 -e "CREATE DATABASE IF NOT EXISTS logistics_fleet; USE logistics_fleet; SELECT 'Database Ready!' as Status;"
    
    if %ERRORLEVEL% EQU 0 (
        echo.
        echo [SUCCESS] Database 'logistics_fleet' is ready!
        echo.
        echo Now restart the backend server:
        echo   cd backend
        echo   npm run dev
        echo.
    ) else (
        echo [ERROR] Failed to create database
    )
) else (
    echo.
    echo [ERROR] MySQL connection failed!
    echo.
    echo Possible reasons:
    echo 1. MySQL service is not running
    echo 2. Password is incorrect
    echo 3. MySQL is not installed
    echo.
    echo Try connecting manually:
    echo   mysql -u root -p
    echo.
    echo Then enter your password when prompted.
    echo.
)

pause
