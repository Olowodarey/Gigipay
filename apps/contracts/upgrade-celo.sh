#!/bin/bash
# Upgrade Gigipay implementation on Celo Mainnet
# Fixes: withdrawBillFunds could drain voucher funds (billFundsBalance tracking added)
# Adds: UUPSUpgradeable for clean future upgrades

set -e

echo "🔧 Upgrading Gigipay on Celo Mainnet..."
echo ""
echo "⚠️  This will upgrade the live contract. Make sure you have:"
echo "   - DEFAULT_ADMIN_ROLE on the proxy"
echo "   - PROXY_ADDRESS set in .env"
echo ""
read -p "Continue? (yes/no): " confirm
[ "$confirm" != "yes" ] && echo "❌ Cancelled" && exit 0

source .env

[ -z "$PRIVATE_KEY" ]    && echo "❌ PRIVATE_KEY not set"    && exit 1
[ -z "$PROXY_ADDRESS" ]  && echo "❌ PROXY_ADDRESS not set"  && exit 1

echo "📋 Upgrading proxy: $PROXY_ADDRESS"
echo ""

forge build

forge script script/UpgradeGigipay.s.sol:UpgradeGigipay \
  --rpc-url https://forno.celo.org \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv

echo ""
echo "✅ Upgrade complete!"
echo "   Proxy address unchanged: $PROXY_ADDRESS"
echo "   billFundsBalance tracking is now active."
