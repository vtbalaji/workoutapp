#!/bin/bash

# Workout App Deployment Script
# Usage: ./deploy.sh "commit message"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if commit message is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Commit message is required${NC}"
    echo "Usage: ./deploy.sh \"Your commit message\""
    exit 1
fi

COMMIT_MESSAGE="$1"

echo -e "${YELLOW}Starting deployment process...${NC}\n"

# Check for uncommitted changes
if [[ -n $(git status -s) ]]; then
    echo -e "${GREEN}Found changes to commit${NC}"

    # Show status
    echo -e "\n${YELLOW}Changed files:${NC}"
    git status -s

    # Add all changes
    echo -e "\n${YELLOW}Adding all changes...${NC}"
    git add .

    # Commit changes
    echo -e "${YELLOW}Committing changes...${NC}"
    git commit -m "$COMMIT_MESSAGE"

    if [ $? -ne 0 ]; then
        echo -e "${RED}Commit failed!${NC}"
        exit 1
    fi

    echo -e "${GREEN}✓ Changes committed successfully${NC}\n"
else
    echo -e "${YELLOW}No changes to commit${NC}\n"
fi

# Push to remote
echo -e "${YELLOW}Pushing to GitHub...${NC}"
git push origin main

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✓ Successfully deployed to GitHub!${NC}"
    echo -e "${GREEN}Repository: git@github.com:vtbalaji/workoutapp.git${NC}"
else
    echo -e "\n${RED}✗ Failed to push to GitHub${NC}"
    exit 1
fi

echo -e "\n${GREEN}Deployment completed!${NC}"
