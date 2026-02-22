@echo off
REM ============================================================================
REM Firebase Configuration Deployment Script (Windows)
REM ============================================================================
REM This script deploys Firestore security rules and indexes to Firebase
REM Run this script after making changes to firestore.rules or firestore.indexes.json
REM ============================================================================

setlocal enabledelayedexpansion

REM ============================================================================
REM Configuration
REM ============================================================================

set "PROJECT_ROOT=%~dp0"
cd /d "%PROJECT_ROOT%"

REM ============================================================================
REM Header
REM ============================================================================

echo.
echo ============================================================================
echo Firebase Configuration Deployment
echo ============================================================================
echo.

REM ============================================================================
REM Pre-flight Checks
REM ============================================================================

echo [INFO] Checking prerequisites...
echo.

REM Check if Firebase CLI is installed
where firebase >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Firebase CLI is not installed
    echo.
    echo Install it with: npm install -g firebase-tools
    echo Then login with: firebase login
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Firebase CLI is installed
echo.

REM Check if user is logged in to Firebase
firebase projects:list >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Not logged in to Firebase
    echo.
    echo Please login with: firebase login
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] Logged in to Firebase
echo.

REM Check if firestore.rules exists
if not exist "firestore.rules" (
    echo [ERROR] firestore.rules file not found
    echo.
    echo Make sure you're running this script from the project root directory
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] firestore.rules file found
echo.

REM Check if firestore.indexes.json exists
if not exist "firestore.indexes.json" (
    echo [ERROR] firestore.indexes.json file not found
    echo.
    echo Make sure you're running this script from the project root directory
    echo.
    pause
    exit /b 1
)

echo [SUCCESS] firestore.indexes.json file found
echo.

REM ============================================================================
REM Deployment Confirmation
REM ============================================================================

echo.
echo ============================================================================
echo Ready to Deploy
echo ============================================================================
echo.
echo This will deploy Firestore rules and indexes to your Firebase project.
echo.

set /p CONFIRM="Continue? (Y/N): "
if /i not "%CONFIRM%"=="Y" (
    echo.
    echo [WARNING] Deployment cancelled
    echo.
    pause
    exit /b 0
)

REM ============================================================================
REM Deployment
REM ============================================================================

echo.
echo ============================================================================
echo Deploying Configuration
echo ============================================================================
echo.

REM Deploy Firestore rules
echo [INFO] Deploying Firestore security rules...
echo.

firebase deploy --only firestore:rules
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to deploy Firestore security rules
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Firestore security rules deployed successfully
echo.

REM Deploy Firestore indexes
echo [INFO] Deploying Firestore indexes...
echo.

firebase deploy --only firestore:indexes
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Failed to deploy Firestore indexes
    echo [WARNING] Note: Indexes may take several minutes to build
    echo.
    pause
    exit /b 1
)

echo.
echo [SUCCESS] Firestore indexes deployed successfully
echo.

REM ============================================================================
REM Post-deployment Information
REM ============================================================================

echo.
echo ============================================================================
echo Deployment Complete
echo ============================================================================
echo.
echo [SUCCESS] All Firebase configurations deployed successfully!
echo.
echo Next steps:
echo   1. Check Firebase Console to verify rules are active
echo   2. Monitor index build status in Firebase Console ^> Firestore ^> Indexes
echo   3. Test your application to ensure everything works correctly
echo.
echo [WARNING] Note: Firestore indexes may take 5-15 minutes to build
echo [WARNING] Your app may show errors until indexes are ready
echo.

REM Get current Firebase project
for /f "tokens=*" %%i in ('firebase use 2^>nul ^| findstr "Active"') do (
    set "PROJECT_LINE=%%i"
)

if defined PROJECT_LINE (
    for /f "tokens=3 delims=()" %%a in ("!PROJECT_LINE!") do (
        set "PROJECT_ID=%%a"
        echo [INFO] Deployed to project: !PROJECT_ID!
        echo.
        echo Firebase Console: https://console.firebase.google.com/project/!PROJECT_ID!/firestore
        echo.
    )
)

echo.
echo [SUCCESS] Deployment script completed!
echo.
echo Press any key to exit...
pause >nul

endlocal
exit /b 0
