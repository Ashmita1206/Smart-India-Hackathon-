#!/bin/bash

echo "🎓 Setting up Smart Student Hub..."
echo "=================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js (v14 or higher) first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install root dependencies
echo "📦 Installing root dependencies..."
npm install

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client
npm install
cd ..

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server
npm install
cd ..

# Create server .env file if it doesn't exist
if [ ! -f "server/.env" ]; then
    echo "📝 Creating server environment file..."
    cp server/env.example server/.env
    echo "⚠️  Please edit server/.env with your configuration"
fi

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p server/uploads/activities

echo ""
echo "🎉 Setup complete!"
echo "=================="
echo ""
echo "To start the development servers:"
echo "  npm run dev"
echo ""
echo "This will start:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend: http://localhost:5000"
echo ""
echo "Demo Credentials:"
echo "  Student: student@demo.com / password123"
echo "  Faculty: faculty@demo.com / password123"
echo ""
echo "📚 See README.md for more information"
