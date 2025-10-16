@echo off
echo ========================================
echo    FIXING REGISTRATION ISSUE
echo ========================================
echo.

echo Step 1: Creating frontend .env file...
cd frontend
(
echo REACT_APP_API_URL=http://localhost:5000/api
echo REACT_APP_SOCKET_URL=http://localhost:5000
) > .env

if exist .env (
    echo [SUCCESS] Frontend .env file created!
) else (
    echo [ERROR] Failed to create frontend .env file
    pause
    exit /b 1
)

echo.
echo Step 2: Checking backend .env file...
cd ..\backend
if exist .env (
    echo [SUCCESS] Backend .env file exists!
) else (
    echo [WARNING] Backend .env file missing! Creating it...
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
    echo [SUCCESS] Backend .env file created!
    echo [WARNING] If MySQL has a password, edit backend\.env and add it to DB_PASSWORD
)

echo.
echo ========================================
echo    SETUP COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. RESTART the frontend server (Ctrl+C then npm start)
echo 2. Open browser console (F12) to see detailed error logs
echo 3. Try registration again
echo.
echo The error message will now show exactly what's wrong!
echo.
pause
