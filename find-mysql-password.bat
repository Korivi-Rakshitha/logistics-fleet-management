@echo off
echo ========================================
echo    MYSQL PASSWORD FINDER
echo ========================================
echo.
echo Testing common MySQL passwords...
echo.

set "passwords=root admin password mysql Password@123 Admin@123 Root@123 Rakshitha@11 rakshitha@11 Rakshitha11"

for %%p in (%passwords%) do (
    echo Testing password: %%p
    mysql -u root -p%%p -e "SELECT 'SUCCESS' as Status;" 2>nul
    if !ERRORLEVEL! EQU 0 (
        echo.
        echo ========================================
        echo    ✅ FOUND IT! Password is: %%p
        echo ========================================
        echo.
        echo Now updating backend\.env file...
        cd backend
        (
        echo PORT=5000
        echo DB_HOST=localhost
        echo DB_USER=root
        echo DB_PASSWORD=%%p
        echo DB_NAME=logistics_fleet
        echo JWT_SECRET=my_super_secret_jwt_key_12345_change_this_in_production
        echo NODE_ENV=development
        echo FRONTEND_URL=http://localhost:3000
        ) > .env
        echo.
        echo [SUCCESS] backend\.env updated with correct password!
        echo.
        echo Creating database...
        mysql -u root -p%%p -e "CREATE DATABASE IF NOT EXISTS logistics_fleet;" 2>nul
        echo.
        echo ========================================
        echo    ALL DONE! Now restart backend:
        echo ========================================
        echo.
        echo   cd backend
        echo   npm run dev
        echo.
        goto :found
    )
)

echo.
echo ========================================
echo    ❌ Password Not Found
echo ========================================
echo.
echo None of the common passwords worked.
echo.
echo Please try manually:
echo   1. Open Command Prompt
echo   2. Run: mysql -u root -p
echo   3. Enter your password when prompted
echo.
echo If you don't remember the password, you need to reset it.
echo See: FIX_DATABASE_CONNECTION.md for reset instructions
echo.
goto :end

:found
echo Password found and configured!

:end
pause
