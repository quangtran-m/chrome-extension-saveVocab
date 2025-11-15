#!/bin/bash

# Git deployment script for JP Vocab Extension

echo "🚀 Deploying JP Vocab Extension to GitHub..."

# Check git status
echo "📊 Current git status:"
git status --short

echo ""
echo "📦 Files ready for commit:"
echo "✅ manifest.json (v1.6)"
echo "✅ content.js (674 lines)"  
echo "✅ firebase-sync.js (enhanced)"
echo "✅ env-loader.js (security)"
echo "✅ README.md (complete guide)"
echo "✅ .env.example (template)"
echo "✅ .gitignore (protection)"
echo "✅ Setup & debug scripts"

echo ""
read -p "🤔 Proceed with commit? (y/N): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📝 Staging files..."
    git add .
    
    echo "💬 Committing with detailed message..."
    git commit -m "v1.6: Complete UI refactor with dropdown menu and stability fixes

Features:
- Clean dropdown menu interface replacing 4 separate buttons  
- Always-on Firebase sync with auto-upload
- Toolbar watchdog preventing UI disappearance
- Environment variables for secure Firebase config
- Enhanced debug system with troubleshooting tools
- Professional documentation and setup guides

Technical improvements:
- UI watchdog monitors toolbar visibility
- Delayed button handler attachment for reliability
- Comprehensive error handling and fallbacks
- Auto-restore functionality for UI elements
- Debug commands for troubleshooting
- Production-ready code structure

Security:
- .env file for Firebase credentials (gitignored)
- Template .env.example for contributors  
- No hardcoded sensitive data
- REST API implementation avoiding CSP issues

Ready for production use! 🎉"
    
    echo ""
    echo "🌐 Pushing to GitHub..."
    git push origin master
    
    echo ""
    echo "🎉 Successfully deployed to GitHub!"
    echo "📊 Repository: https://github.com/quangtran-m/chrome-extension-saveVocab"
    echo ""
    echo "📋 Next steps for users:"
    echo "1. Clone: git clone https://github.com/quangtran-m/chrome-extension-saveVocab"
    echo "2. Setup: ./setup.sh"  
    echo "3. Configure: Edit .env file"
    echo "4. Load in Chrome Extensions"
    echo "5. Enjoy! 🎯"
    
else
    echo "❌ Deployment cancelled"
    echo "💡 Run 'git status' to see what would be committed"
fi