#!/bin/bash

# Local Testing Setup Script for Todo API
# This script sets up and runs the Postman test collection locally

set -e

echo "=========================================="
echo "Todo API - Local Test Setup"
echo "=========================================="

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: Docker is not installed${NC}"
    echo "Please install Docker from https://www.docker.com/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}Error: npm is not installed${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo -e "${GREEN}✓ Docker found${NC}"
echo -e "${GREEN}✓ npm found${NC}"
echo ""

# Step 1: Install dependencies
echo -e "${YELLOW}Step 1: Installing npm dependencies...${NC}"
npm install
echo -e "${GREEN}✓ npm dependencies installed${NC}"
echo ""

# Step 2: Install Newman globally
echo -e "${YELLOW}Step 2: Installing Newman and HTML reporter...${NC}"
npm install -g newman
npm install -g newman-reporter-html
echo -e "${GREEN}✓ Newman and HTML reporter installed${NC}"
echo ""

# Step 3: Start MongoDB
echo -e "${YELLOW}Step 3: Starting MongoDB container...${NC}"
MONGO_CONTAINER=$(docker run -d --name mongo-test-$$ -p 27017:27017 mongo:6.0 2>/dev/null || echo "")

if [ -z "$MONGO_CONTAINER" ]; then
    echo -e "${RED}Warning: Could not start MongoDB. Is port 27017 in use?${NC}"
    echo "Try: docker ps | grep mongo"
    exit 1
fi

echo -e "${GREEN}✓ MongoDB started (Container ID: $MONGO_CONTAINER)${NC}"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}Cleaning up...${NC}"
    docker stop mongo-test-$$ 2>/dev/null || true
    docker rm mongo-test-$$ 2>/dev/null || true
    pkill -f "node server.js" 2>/dev/null || true
    echo -e "${GREEN}✓ Cleanup complete${NC}"
}

trap cleanup EXIT

# Step 4: Start the API server
echo -e "${YELLOW}Step 4: Starting API server...${NC}"
export MONGODB_URI="mongodb://localhost:27017/todoapp"
export NODE_ENV="test"
npm start &
SERVER_PID=$!
echo -e "${GREEN}✓ Server started (PID: $SERVER_PID)${NC}"

# Wait for server to be ready
echo -e "${YELLOW}Step 5: Waiting for server to be ready...${NC}"
sleep 3

# Check if server is responding
for i in {1..10}; do
    if curl -f http://localhost:3000/todos > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Server is ready${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}Error: Server did not respond in time${NC}"
        exit 1
    fi
    echo "Attempt $i: Waiting for server..."
    sleep 1
done

echo ""

# Step 6: Run Postman tests
echo -e "${YELLOW}Step 6: Running Postman API tests...${NC}"
echo "=========================================="
echo ""

newman run Postman_Collection.json \
  -e Postman_Environment.json \
  -g globals.json \
  -r cli,json,html \
  --reporter-json-export postman-results.json \
  --reporter-html-export postman-report.html \
  --bail \
  --timeout 10000 \
  --timeout-request 5000

TEST_RESULT=$?

echo ""
echo "=========================================="

if [ $TEST_RESULT -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed!${NC}"
    echo ""
    echo "Reports generated:"
    echo "  - postman-report.html (Open in browser)"
    echo "  - postman-results.json (Detailed results)"
else
    echo -e "${RED}✗ Tests failed${NC}"
    echo ""
    echo "Reports generated:"
    echo "  - postman-report.html (Open in browser)"
    echo "  - postman-results.json (Detailed results)"
fi

echo ""

exit $TEST_RESULT
