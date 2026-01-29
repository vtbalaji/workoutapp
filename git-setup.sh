#!/bin/bash

# Git Setup Script
# This script helps you push your code to GitHub

echo "=== Git Setup and Push Script ==="
echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "Initializing git repository..."
    git init
    echo "✓ Git initialized"
else
    echo "✓ Git already initialized"
fi

# Check if remote exists
if git remote | grep -q "origin"; then
    echo "✓ Remote 'origin' already exists"
else
    echo "Adding remote repository..."
    git remote add origin git@github.com:vtbalaji/workoutapp.git
    echo "✓ Remote added"
fi

# Show current status
echo ""
echo "Current git status:"
git status -s

# Stage all files
echo ""
echo "Staging all files..."
git add .
echo "✓ Files staged"

# Rename branch to main
echo ""
echo "Setting branch to 'main'..."
git branch -M main
echo "✓ Branch set to main"

# Commit
echo ""
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Initial commit: Workout app with exercise library, workout builder, and Firebase integration"
fi

git commit -m "$COMMIT_MSG"
echo "✓ Changes committed"

# Push to GitHub
echo ""
echo "Pushing to GitHub..."
echo "If this fails, you may need to set up SSH keys or use HTTPS instead."
echo ""

git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "✓✓✓ SUCCESS! Code pushed to GitHub ✓✓✓"
    echo "Repository: https://github.com/vtbalaji/workoutapp"
else
    echo ""
    echo "⚠ Push failed. Try one of these options:"
    echo ""
    echo "Option 1: Use HTTPS instead of SSH"
    echo "  git remote set-url origin https://github.com/vtbalaji/workoutapp.git"
    echo "  git push -u origin main"
    echo ""
    echo "Option 2: Set up SSH keys"
    echo "  1. Generate SSH key: ssh-keygen -t ed25519 -C 'your_email@example.com'"
    echo "  2. Copy key: cat ~/.ssh/id_ed25519.pub"
    echo "  3. Add to GitHub: https://github.com/settings/keys"
    echo "  4. Then run: git push -u origin main"
fi
