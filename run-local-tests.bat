@echo off
REM Local Testing Setup Script for Todo API (Windows)
REM This script sets up and runs the Postman test collection locally

setlocal enabledelayedexpansion

echo.
echo ==========================================
echo Todo API - Local Test Setup (Windows)
echo ==========================================
echo.

REM Check if Docker is installed
docker --version >nul 2>&1
if errorlevel 1 (
    echo Error: Docker is not installed
    echo Please install Docker from https://www.docker.com/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo Error: npm is not installed
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo [OK] Docker found
echo [OK] npm found
echo.

REM Step 1: Install dependencies
echo Installing npm dependencies...
call npm install
if errorlevel 1 (
    echo Error: npm install failed
    pause
    exit /b 1
)
echo [OK] npm dependencies installed
echo.

REM Step 2: Install Newman globally
echo Installing Newman and HTML reporter...
call npm install -g newman
call npm install -g newman-reporter-html
if errorlevel 1 (
    echo Error: Newman installation failed
    pause
    exit /b 1
)
echo [OK] Newman and HTML reporter installed
echo.

REM Step 3: Start MongoDB
echo Starting MongoDB container...
for /f "tokens=*" %%i in ('docker run -d --name mongo-test-local -p 27017:27017 mongo:6.0 2^>nul') do set MONGO_CONTAINER=%%i

if "!MONGO_CONTAINER!"=="" (
    echo Warning: Could not start MongoDB. Is port 27017 in use?
    echo Try: docker ps ^| findstr mongo
    pause
    exit /b 1
)

echo [OK] MongoDB started
echo.

REM Step 4: Start the API server
echo Starting API server...
set MONGODB_URI=mongodb://localhost:27017/todoapp
set NODE_ENV=test
start "Todo API Server" /MIN npm start
echo [OK] Server started
echo.

REM Wait for server to be ready
echo Waiting for server to be ready...
timeout /t 3 /nobreak

REM Try to connect
setlocal enabledelayedexpansion
set "counter=0"
:wait_loop
set /a counter+=1
powershell -Command "(New-Object Net.WebClient).DownloadString('http://localhost:3000/todos')" >nul 2>&1
if errorlevel 1 (
    if !counter! lss 10 (
        echo Attempt !counter!: Waiting for server...
        timeout /t 1 /nobreak
        goto wait_loop
    ) else (
        echo Error: Server did not respond in time
        pause
        exit /b 1
    )
)

echo [OK] Server is ready
echo.

REM Step 5: Run Postman tests
echo ==========================================
echo Running Postman API tests...
echo ==========================================
echo.

call newman run Postman_Collection.json ^
  -e Postman_Environment.json ^
  -g globals.json ^
  -r cli,json,html ^
  --reporter-json-export postman-results.json ^
  --reporter-html-export postman-report.html ^
  --bail ^
  --timeout 10000 ^
  --timeout-request 5000

set TEST_RESULT=%errorlevel%

echo.
echo ==========================================

if %TEST_RESULT% equ 0 (
    echo [OK] All tests passed!
) else (
    echo [FAILED] Tests failed
)

echo.
echo Reports generated:
echo   - postman-report.html ^(Open in browser^)
echo   - postman-results.json ^(Detailed results^)
echo.

REM Cleanup
echo Cleaning up...
taskkill /FI "WINDOWTITLE eq Todo API Server" /T /F >nul 2>&1
docker stop mongo-test-local >nul 2>&1
docker rm mongo-test-local >nul 2>&1
echo [OK] Cleanup complete
echo.

pause
exit /b %TEST_RESULT%
