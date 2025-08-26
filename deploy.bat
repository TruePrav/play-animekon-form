@echo off
REM Production Deployment Script for Windows
REM This script automates the deployment process for production

echo 🚀 Starting production deployment...

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: package.json not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Check if .env.local exists
if not exist ".env.local" (
    echo ❌ Error: .env.local file not found!
    echo Please create .env.local with your production environment variables.
    echo You can use env.production.template as a reference.
    pause
    exit /b 1
)

REM Verify NODE_ENV is set to production
findstr "NODE_ENV=production" .env.local >nul
if errorlevel 1 (
    echo ⚠️  Warning: NODE_ENV is not set to production in .env.local
    echo Please ensure NODE_ENV=production is set for production deployment.
)

echo 📦 Installing dependencies...
call npm ci --only=production

echo 🧹 Cleaning previous build...
if exist ".next" rmdir /s /q ".next"

echo 🔍 Running security audit...
call npm run security:audit

echo 🔍 Running linting...
call npm run lint

echo 🔍 Running type check...
call npm run type-check

echo 🏗️  Building for production...
call npm run build

echo ✅ Build completed successfully!

echo.
echo 🎉 Production deployment preparation completed!
echo.
echo Next steps:
echo 1. Deploy the .next folder to your hosting platform
echo 2. Set environment variables on your hosting platform
echo 3. Configure your domain and SSL certificate
echo 4. Set up monitoring and logging services
echo.
echo For detailed instructions, see PRODUCTION_CHECKLIST.md
echo.
pause
