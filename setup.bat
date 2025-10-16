@echo off
echo ========================================
echo Logistics Fleet Management System Setup
echo ========================================
echo.

echo [1/4] Installing Backend Dependencies...
cd backend
call npm install
if %errorlevel% neq 0 (
    echo Error: Backend installation failed
    pause
    exit /b 1
)
echo Backend dependencies installed successfully!
echo.

echo [2/4] Installing Frontend Dependencies...
cd ..\frontend
call npm install
if %errorlevel% neq 0 (
    echo Error: Frontend installation failed
    pause
    exit /b 1
)
echo Frontend dependencies installed successfully!
echo.

echo [3/4] Setting up Environment Files...
cd ..\backend
if not exist .env (
    copy .env.example .env
    echo Backend .env file created. Please update with your database credentials.
)

cd ..\frontend
if not exist .env (
    copy .env.example .env
    echo Frontend .env file created.
)
echo.

echo [4/4] Setup Complete!
echo.
echo ========================================
echo Next Steps:
echo ========================================
echo 1. Update backend/.env with your MySQL credentials
echo 2. Run: cd backend ^&^& npm run init-db
echo 3. Start backend: cd backend ^&^& npm run dev
echo 4. Start frontend: cd frontend ^&^& npm start
echo.
echo Default admin credentials:
echo Email: admin@logistics.com
echo Password: admin123
echo ========================================
echo.
pause
