#!/bin/bash
# Upgrade Gigipay implementation on Base Mainnet

set -e

echo "🔧 Upgrading Gigipay on Base Mainnet..."
echo ""
read -p "Continue? (yes/no): " confirm
[ "$confirm" != "yes" ] && echo "❌ Cancelled" && exit 0

source .env

[ -z "$PRIVATE_KEY" ]    && echo "❌ PRIVATE_KEY not set"    && exit 1
[ -z "$PROXY_ADDRESS" ]  && echo "❌ PROXY_ADDRESS not set"  && exit 1

echo "📋 Upgrading proxy: $PROXY_ADDRESS"

forge build

forge script script/UpgradeGigipay.s.sol:UpgradeGigipay \
  --rpc-url https://mainnet.base.org \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv

echo ""
echo "✅ Upgrade complete!"
echo "   Proxy address unchanged: $PROXY_ADDRESS"
