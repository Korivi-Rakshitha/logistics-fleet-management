@echo off
echo ========================================
echo    FIXING MYSQL PASSWORD ISSUE
echo ========================================
echo.

echo Step 1: Testing MySQL connection WITHOUT password...
echo.

mysql -u root -e "SELECT 'SUCCESS: MySQL works without password!' as Status;" 2>nul

if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] MySQL connection works WITHOUT password!
    echo.
    echo Step 2: Creating clean backend .env file...
    cd backend
    (
    echo PORT=5000
    echo DB_HOST=localhost
    echo DB_USER=root
    echo DB_PASSWORD=
    echo DB_NAME=logistics_fleet
    echo JWT_SECRET=my_super_secret_jwt_key_12345_change_this_in_production
    echo NODE_ENV=development
    echo FRONTEND_URL=http://localhost:3000
    ) > .env
    
    echo [SUCCESS] Clean .env file created!
    echo.
    echo Step 3: Creating database...
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS logistics_fleet; SHOW DATABASES;" 2>nul
    
    if %ERRORLEVEL% EQU 0 (
        echo [SUCCESS] Database 'logistics_fleet' ready!
        echo.
        echo ========================================
        echo    ALL DONE! Now restart backend:
        echo ========================================
        echo.
        echo   cd backend
        echo   npm run dev
        echo.
        echo You should see:
        echo   ✅ Database connected successfully
        echo.
    ) else (
        echo [ERROR] Failed to create database
    )
) else (
    echo [FAILED] MySQL requires a password!
    echo.
    echo Let's try to find your password...
    echo.
    echo Please try connecting manually:
    echo   mysql -u root -p
    echo.
    echo Try these common passwords:
    echo   - root
    echo   - admin
    echo   - password
    echo   - (empty - just press Enter)
    echo   - Rakshitha@11
    echo.
    echo Once you find the correct password, edit:
    echo   backend\.env
    echo.
    echo And set:
    echo   DB_PASSWORD=your_correct_password
    echo.
)

pause
