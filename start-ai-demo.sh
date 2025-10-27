#!/bin/bash

# Start AI Demo Script
# This script starts the AI service and frontend for testing the chatbot demo

echo "🚀 Starting Zoptal AI Demo..."
echo ""

# Check if services are already running
echo "📋 Checking for running services..."
lsof -i :4003 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "⚠️  AI service already running on port 4003"
else
    echo "✅ Port 4003 is available"
fi

lsof -i :3000 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "⚠️  Frontend already running on port 3000"
else
    echo "✅ Port 3000 is available"
fi

echo ""
echo "📝 API Key Configuration Status:"
echo "================================"

# Check if API keys are configured
if grep -q "YOUR_ACTUAL_OPENAI_KEY_HERE" .env; then
    echo "❌ OpenAI API key not configured"
    echo "   👉 Get your key from: https://platform.openai.com/api-keys"
    echo "   👉 Update OPENAI_API_KEY in .env file"
else
    echo "✅ OpenAI API key configured"
fi

if grep -q "YOUR_ACTUAL_ANTHROPIC_KEY_HERE" .env; then
    echo "⚠️  Anthropic API key not configured (optional)"
else
    echo "✅ Anthropic API key configured"
fi

if grep -q "YOUR_ACTUAL_GOOGLE_AI_KEY_HERE" .env; then
    echo "⚠️  Google AI API key not configured (optional)"
else
    echo "✅ Google AI API key configured"
fi

echo ""
echo "🔧 Starting services..."
echo "================================"

# Function to start a service in background
start_service() {
    local service_name=$1
    local service_dir=$2
    local start_cmd=$3
    local port=$4
    
    echo ""
    echo "Starting $service_name..."
    
    # Check if already running
    lsof -i :$port > /dev/null 2>&1
    if [ $? -eq 0 ]; then
        echo "✅ $service_name already running on port $port"
        return
    fi
    
    # Start the service
    cd "$service_dir"
    eval "$start_cmd" > /dev/null 2>&1 &
    local pid=$!
    
    # Wait for service to start (max 10 seconds)
    for i in {1..20}; do
        sleep 0.5
        lsof -i :$port > /dev/null 2>&1
        if [ $? -eq 0 ]; then
            echo "✅ $service_name started successfully (PID: $pid, Port: $port)"
            return
        fi
    done
    
    echo "❌ Failed to start $service_name"
}

# Start AI Service
start_service "AI Service" "services/ai-service" "npm run dev" 4003

# Start Auth Service (required for some AI features)
start_service "Auth Service" "services/auth-service" "OTP_SECRET='mock-otp-secret-32-chars-for-development-environment' npm run dev" 4001

# Start Frontend
start_service "Frontend" "apps/web-main" "npm run dev" 3000

echo ""
echo "================================"
echo "🎉 Services Starting!"
echo ""
echo "📍 Access Points:"
echo "   • Frontend: http://localhost:3000"
echo "   • AI Demo: http://localhost:3000/demos/ai-chatbot-live"
echo "   • AI Service: http://localhost:4003"
echo "   • AI Health: http://localhost:4003/health"
echo ""
echo "💡 Tips:"
echo "   1. Make sure to add your OpenAI API key to .env"
echo "   2. The demo will use GPT-3.5 Turbo to save costs"
echo "   3. Fallback responses will be used if AI service fails"
echo ""
echo "🛑 To stop all services, press Ctrl+C or run:"
echo "   pkill -f 'node.*4003' && pkill -f 'node.*4001' && pkill -f 'next dev'"
echo ""
echo "Waiting for services to fully initialize..."
sleep 3
echo ""
echo "✨ Ready! Open http://localhost:3000/demos/ai-chatbot-live in your browser"
echo ""

# Keep script running
echo "Press Ctrl+C to stop all services..."
wait