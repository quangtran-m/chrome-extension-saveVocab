#!/bin/bash

# Quick test script for JP Vocab Extension

echo "🧪 Testing JP Vocab Extension..."

# Check if files exist
echo "📁 Checking files..."
if [ ! -f "content.js" ]; then
    echo "❌ content.js not found"
    exit 1
fi

if [ ! -f "manifest.json" ]; then
    echo "❌ manifest.json not found"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found - Firebase sync may not work"
    echo "   Run: cp .env.example .env"
fi

echo "✅ All core files present"

# Check manifest version
version=$(grep '"version"' manifest.json | cut -d'"' -f4)
echo "📦 Extension version: $version"

# Check content.js size
size=$(wc -l < content.js)
echo "📊 content.js lines: $size"

# Check if debug functions are present
if grep -q "forceShowToolbar" content.js; then
    echo "🔧 Debug functions available"
else
    echo "⚠️  Debug functions not found"
fi

echo ""
echo "🚀 Extension ready to load!"
echo ""
echo "📋 Next steps:"
echo "   1. Open Chrome -> Extensions"
echo "   2. Enable Developer mode"
echo "   3. Click 'Load unpacked'"
echo "   4. Select this folder"
echo "   5. Open any website"
echo "   6. Check console for debug messages"
echo "   7. Look for toolbar at bottom-left"
echo ""
echo "🔍 Troubleshooting:"
echo "   - Press F12 -> Console to see debug logs"
echo "   - Run: forceShowToolbar() to test"
echo "   - Check for toolbar: document.getElementById('jp-vocab-toolbar')"