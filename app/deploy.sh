#!/bin/bash

# Shipment Management System - Deployment Script
# This script will deploy your application to Netlify

echo "🚀 Deploying Shipment Management System..."
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the app directory"
    echo "   cd app && ./deploy.sh"
    exit 1
fi

# Check if dist folder exists
if [ ! -d "dist" ]; then
    echo "📦 Building application..."
    npm run build
    if [ $? -ne 0 ]; then
        echo "❌ Build failed. Please fix errors and try again."
        exit 1
    fi
    echo "✅ Build complete!"
    echo ""
fi

# Check if netlify-cli is installed
if ! command -v npx &> /dev/null; then
    echo "❌ npx not found. Please install Node.js"
    exit 1
fi

echo "🔐 Logging in to Netlify..."
echo "   (This will open your browser)"
echo ""
npx netlify login

if [ $? -ne 0 ]; then
    echo "❌ Login failed. Please try again."
    exit 1
fi

echo ""
echo "🚀 Deploying to production..."
echo ""
npx netlify deploy --prod --dir=dist

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deployment successful!"
    echo ""
    echo "📋 Next steps:"
    echo "   1. Open the deployment URL shown above"
    echo "   2. Test login with: documentation@company.com / documentation123"
    echo "   3. Create a test file to verify everything works"
    echo "   4. Share the URL with your team"
    echo ""
    echo "📚 Documentation:"
    echo "   - User credentials: ../USER_CREDENTIALS.md"
    echo "   - Quick guide: ../QUICK_LOGIN_GUIDE.txt"
    echo "   - Full docs: ../SYSTEM_DEPLOYMENT_COMPLETE.md"
    echo ""
    echo "🎉 Your system is now live!"
else
    echo ""
    echo "❌ Deployment failed."
    echo ""
    echo "💡 Try the drag & drop method instead:"
    echo "   1. Go to https://app.netlify.com/drop"
    echo "   2. Drag the 'dist' folder onto the page"
    echo "   3. Your site will be live instantly!"
fi
