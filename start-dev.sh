#!/bin/bash

# Check if the dev server is already running
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo "🚀 Development server is already running on port 3000"
    echo "📱 Open http://localhost:3000 in your browser"
else
    echo "🚀 Starting development server..."
    echo "📱 The app will be available at http://localhost:3000"
    echo "⏹️  Press Ctrl+C to stop the server"
    echo ""
    npm run dev
fi 