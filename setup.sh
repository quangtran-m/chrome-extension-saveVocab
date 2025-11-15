#!/bin/bash

# Setup script for JP Vocab Highlighter Extension

echo "🚀 Setting up JP Vocab Highlighter Extension..."

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "📋 Creating .env file from template..."
    cp .env.example .env
    echo "✅ .env file created!"
    echo ""
    echo "⚠️  IMPORTANT: Please edit .env file with your Firebase configuration:"
    echo "   1. Open .env file in your editor"
    echo "   2. Replace the placeholder values with your Firebase config"
    echo "   3. Save the file"
    echo ""
    echo "🔗 Get Firebase config from: https://console.firebase.google.com/"
    echo ""
else
    echo "✅ .env file already exists"
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📦 Initializing git repository..."
    git init
    echo "✅ Git repository initialized!"
else
    echo "✅ Git repository already initialized"
fi

# Check if .gitignore exists
if [ ! -f ".gitignore" ]; then
    echo "🛡️  .gitignore file missing! Creating..."
    cat > .gitignore << 'EOF'
# Environment Variables
.env

# Node modules
node_modules/
npm-debug.log*

# OS generated files
.DS_Store
Thumbs.db

# IDE files
.vscode/
.idea/

# Extension files
*.zip
*.crx
*.pem
EOF
    echo "✅ .gitignore created!"
else
    echo "✅ .gitignore already exists"
fi

echo ""
echo "🎉 Setup completed!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit .env file with your Firebase configuration"
echo "   2. Load extension in Chrome (Developer mode)"
echo "   3. Test the sync functionality"
echo ""
echo "📚 For detailed instructions, see README.md"