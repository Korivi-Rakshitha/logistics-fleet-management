@echo off
echo ========================================
echo    CONVERTING TO SQLITE DATABASE
echo ========================================
echo.

echo Step 1: Updating backend .env file...
cd backend
(
echo PORT=5000
echo NODE_ENV=development
echo JWT_SECRET=my_super_secret_jwt_key_12345_change_this_in_production
echo FRONTEND_URL=http://localhost:3000
) > .env

if exist .env (
    echo [SUCCESS] Backend .env updated for SQLite!
) else (
    echo [ERROR] Failed to update backend .env
    pause
    exit /b 1
)

echo.
echo Step 2: Initializing SQLite database...
call npm run init-db

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo    CONVERSION COMPLETE!
    echo ========================================
    echo.
    echo ✅ SQLite database created successfully!
    echo ✅ No MySQL password needed!
    echo ✅ Database file: backend\logistics_fleet.db
    echo.
    echo Default Admin Account:
    echo   📧 Email: admin@logistics.com
    echo   🔑 Password: admin123
    echo.
    echo ========================================
    echo    NOW START THE SERVERS:
    echo ========================================
    echo.
    echo Terminal 1 - Backend:
    echo   cd backend
    echo   npm run dev
    echo.
    echo Terminal 2 - Frontend:
    echo   cd frontend
    echo   npm start
    echo.
    echo Then test registration at:
    echo   http://localhost:3000/signup
    echo.
) else (
    echo.
    echo [ERROR] Database initialization failed
    echo Check the error messages above
)

pause
