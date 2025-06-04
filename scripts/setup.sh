#!/bin/bash

# 🚀 Vibe-Builder Setup Script
# This script helps set up the development environment

echo "🚀 Setting up Vibe-Builder Development Environment..."

# Check if required tools are installed
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "🔧 Installing Supabase CLI..."
    npm install -g supabase
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Setup environment file
if [ ! -f .env.local ]; then
    echo "⚙️ Creating environment file..."
    cat > .env.local << EOL
# Supabase Configuration (Replace with your actual values)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# OAuth Providers
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
GITHUB_CLIENT_ID=your_github_oauth_client_id
GITHUB_CLIENT_SECRET=your_github_oauth_client_secret

# Application Settings
VITE_APP_NAME=Vibe-Builder
VITE_APP_URL=http://localhost:8080
EOL
    echo "✅ Created .env.local file. Please update it with your actual values."
else
    echo "✅ Environment file already exists."
fi

# Initialize Supabase (if not already done)
if [ ! -f supabase/.branches/_current_branch ]; then
    echo "🗄️ Initializing Supabase..."
    supabase init
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your Supabase and API keys"
echo "2. Start Supabase: npm run supabase:start"
echo "3. Run migrations: npm run supabase:migrate"
echo "4. Start development server: npm run dev"
echo ""
echo "For more information, see README.md" 