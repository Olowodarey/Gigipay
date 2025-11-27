#!/bin/bash

# Gigipay Deployment Script for Celo
# Following Celo's official Foundry documentation

set -e  # Exit on error

echo "🚀 Deploying Gigipay to Celo Sepolia Testnet..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create a .env file from .env.example:"
    echo "  cp .env.example .env"
    echo "  nano .env"
    exit 1
fi

# Load environment variables
source .env

# Validate required environment variables
if [ -z "$PRIVATE_KEY" ]; then
    echo "❌ Error: PRIVATE_KEY not set in .env file"
    exit 1
fi

if [ -z "$DEFAULT_ADMIN" ]; then
    echo "❌ Error: DEFAULT_ADMIN not set in .env file"
    exit 1
fi

if [ -z "$PAUSER" ]; then
    echo "❌ Error: PAUSER not set in .env file"
    exit 1
fi

echo "📋 Deployment Configuration:"
echo "  Network: Celo Sepolia Testnet"
echo "  RPC: celo-sepolia (from foundry.toml)"
echo "  Default Admin: $DEFAULT_ADMIN"
echo "  Pauser: $PAUSER"
echo ""

# Run the deployment script
echo "🔨 Compiling contracts..."
forge build

echo ""
echo "📤 Deploying contracts..."
forge script script/DeployGigipay.s.sol:DeployGigipay \
  --rpc-url celo-sepolia \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv

echo ""
echo "✅ Deployment complete!"
echo ""
echo "⚠️  IMPORTANT: Save the proxy address from the output above."
echo "    Users should interact with the PROXY address, not the implementation!"
