#!/bin/bash

# Production Deployment Script
# This script automates the deployment process for production

set -e  # Exit on any error

echo "🚀 Starting production deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "❌ Error: .env.local file not found!"
    echo "Please create .env.local with your production environment variables."
    echo "You can use env.production.template as a reference."
    exit 1
fi

# Verify NODE_ENV is set to production
if ! grep -q "NODE_ENV=production" .env.local; then
    echo "⚠️  Warning: NODE_ENV is not set to production in .env.local"
    echo "Please ensure NODE_ENV=production is set for production deployment."
fi

echo "📦 Installing dependencies..."
npm ci --only=production

echo "🧹 Cleaning previous build..."
rm -rf .next

echo "🔍 Running security audit..."
npm run security:audit

echo "🔍 Running linting..."
npm run lint

echo "🔍 Running type check..."
npm run type-check

echo "🏗️  Building for production..."
npm run build

echo "✅ Build completed successfully!"

echo "🧪 Testing production build..."
npm run start &
SERVER_PID=$!

# Wait for server to start
sleep 10

# Test if server is responding
if curl -f http://localhost:3000 > /dev/null 2>&1; then
    echo "✅ Production build test successful!"
else
    echo "❌ Production build test failed!"
    kill $SERVER_PID
    exit 1
fi

# Stop test server
kill $SERVER_PID

echo ""
echo "🎉 Production deployment preparation completed!"
echo ""
echo "Next steps:"
echo "1. Deploy the .next folder to your hosting platform"
echo "2. Set environment variables on your hosting platform"
echo "3. Configure your domain and SSL certificate"
echo "4. Set up monitoring and logging services"
echo ""
echo "For detailed instructions, see PRODUCTION_CHECKLIST.md"
