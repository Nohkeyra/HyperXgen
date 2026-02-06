#!/bin/bash
cd ~/hyperxgen7/HyperXgen

# Find the actual CSS file in dist
CSS_FILE=$(find dist -name "*.css" -type f | grep -v test | head -1)
CSS_NAME=$(basename "$CSS_FILE")

echo "Found CSS file: $CSS_NAME"

# Update index.html with correct path
sed -i "s|href=\"[^\"]*\.css\"|href=\"./assets/$CSS_NAME\"|g" dist/index.html

echo "✅ Fixed CSS links"
echo "CSS now linked to: ./assets/$CSS_NAME"
