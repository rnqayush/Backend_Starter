#!/bin/bash

# StoreBuilder Backend Startup Script
echo "🚀 Starting StoreBuilder Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18 or higher is required. Current version: $(node -v)"
    exit 1
fi

# Check if MongoDB is running
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found. Make sure MongoDB is installed and running."
    echo "   Or update MONGODB_URI in .env to use a remote MongoDB instance."
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run setup script
echo "⚙️  Running setup..."
npm run setup

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it from .env.example"
    exit 1
fi

# Seed database if needed
echo "🌱 Seeding database with sample data..."
npm run seed

# Start the server
echo "🎉 Starting the server..."
if [ "$NODE_ENV" = "production" ]; then
    npm start
else
    npm run dev
fi
