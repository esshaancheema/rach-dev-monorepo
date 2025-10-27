#!/bin/bash

# Smoke test for auth-service
# Usage: ./auth-service-smoke-test.sh <environment> <namespace>

set -euo pipefail

ENVIRONMENT=${1:-blue}
NAMESPACE=${2:-zoptal-$ENVIRONMENT}
SERVICE_NAME="auth-service"
BASE_URL="http://localhost:8080"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

echo "Running smoke tests for $SERVICE_NAME in $ENVIRONMENT environment..."

# Test 1: Health check
echo -n "Testing health endpoint... "
HEALTH_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/health)
if [[ "$HEALTH_RESPONSE" == "200" ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC} (HTTP $HEALTH_RESPONSE)"
    exit 1
fi

# Test 2: Ready check
echo -n "Testing ready endpoint... "
READY_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $BASE_URL/ready)
if [[ "$READY_RESPONSE" == "200" ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC} (HTTP $READY_RESPONSE)"
    exit 1
fi

# Test 3: API version check
echo -n "Testing API version... "
VERSION_RESPONSE=$(curl -s $BASE_URL/api/version)
if [[ "$VERSION_RESPONSE" == *"version"* ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC}"
    exit 1
fi

# Test 4: Login endpoint availability
echo -n "Testing login endpoint... "
LOGIN_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@example.com","password":"test"}')
# We expect 401 for invalid credentials, which means the endpoint is working
if [[ "$LOGIN_RESPONSE" == "401" ]] || [[ "$LOGIN_RESPONSE" == "400" ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC} (HTTP $LOGIN_RESPONSE)"
    exit 1
fi

# Test 5: Register endpoint availability
echo -n "Testing register endpoint... "
REGISTER_RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" -X POST $BASE_URL/api/auth/register \
    -H "Content-Type: application/json" \
    -d '{"email":"","password":""}')
# We expect 400 for invalid data, which means the endpoint is working
if [[ "$REGISTER_RESPONSE" == "400" ]]; then
    echo -e "${GREEN}PASS${NC}"
else
    echo -e "${RED}FAIL${NC} (HTTP $REGISTER_RESPONSE)"
    exit 1
fi

echo -e "\n${GREEN}All smoke tests passed!${NC}"
exit 0