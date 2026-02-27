#!/bin/bash

# Script to start 5 separate development servers on different ports
# Each instance will have its own localStorage, allowing different user sessions

echo "🚀 Starting 5 Development Servers..."
echo ""
echo "Each server will run on a different port with isolated sessions:"
echo "  📱 Session 1: http://localhost:5173"
echo "  📱 Session 2: http://localhost:5174"
echo "  📱 Session 3: http://localhost:5175"
echo "  📱 Session 4: http://localhost:5176"
echo "  📱 Session 5: http://localhost:5177"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Start each server in the background
npm run dev:5173 &
PID1=$!
sleep 2

npm run dev:5174 &
PID2=$!
sleep 2

npm run dev:5175 &
PID3=$!
sleep 2

npm run dev:5176 &
PID4=$!
sleep 2

npm run dev:5177 &
PID5=$!

echo ""
echo "✅ All servers started!"
echo ""
echo "📋 Server URLs:"
echo "  1️⃣  http://localhost:5173"
echo "  2️⃣  http://localhost:5174"
echo "  3️⃣  http://localhost:5175"
echo "  4️⃣  http://localhost:5176"
echo "  5️⃣  http://localhost:5177"
echo ""
echo "💡 Tip: Open each URL in a different browser window or incognito tab"
echo "    to test different user sessions simultaneously"
echo ""

# Wait for all background processes
wait $PID1 $PID2 $PID3 $PID4 $PID5
