@echo off
echo ========================================
echo Logistics Fleet Management - Setup Check
echo ========================================
echo.

echo [1/6] Checking Node.js installation...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
) else (
    node --version
    echo ✅ Node.js is installed
)
echo.

echo [2/6] Checking MySQL installation...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ MySQL is not installed or not in PATH
    echo Please install MySQL from https://dev.mysql.com/downloads/
) else (
    mysql --version
    echo ✅ MySQL is installed
)
echo.

echo [3/6] Checking Backend configuration...
if exist backend\.env (
    echo ✅ Backend .env file exists
) else (
    echo ❌ Backend .env file missing
    echo Creating from .env.example...
    copy backend\.env.example backend\.env >nul
    echo ⚠️  Please update backend/.env with your MySQL credentials
)
echo.

echo [4/6] Checking Frontend configuration...
if exist frontend\.env (
    echo ✅ Frontend .env file exists
) else (
    echo ❌ Frontend .env file missing
    echo Creating from .env.example...
    copy frontend\.env.example frontend\.env >nul
    echo ✅ Frontend .env file created
)
echo.

echo [5/6] Checking Backend dependencies...
if exist backend\node_modules (
    echo ✅ Backend dependencies installed
) else (
    echo ❌ Backend dependencies not installed
    echo Run: cd backend ^&^& npm install
)
echo.

echo [6/6] Checking Frontend dependencies...
if exist frontend\node_modules (
    echo ✅ Frontend dependencies installed
) else (
    echo ❌ Frontend dependencies not installed
    echo Run: cd frontend ^&^& npm install
)
echo.

echo ========================================
echo Setup Check Complete
echo ========================================
echo.
echo Next Steps:
echo 1. Update backend/.env with your MySQL credentials
echo 2. Run: cd backend ^&^& npm run init-db
echo 3. Run: cd backend ^&^& npm run dev (in one terminal)
echo 4. Run: cd frontend ^&^& npm start (in another terminal)
echo.
pause
