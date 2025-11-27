# Gigipay Deployment Guide

Following [Celo's official Foundry documentation](https://docs.celo.org/tooling/dev-environments/foundry#deploy-on-celo-with-foundry).

## ⚠️ Security Best Practices

**NEVER** expose your private key in terminal commands or commit it to git!

## Quick Start

### 1. Setup Environment

```bash
# Create .env file from template
cp .env.example .env

# Edit with your values
nano .env
```

Required variables in `.env`:
- `PRIVATE_KEY`: Your deployer wallet private key (without 0x prefix)
- `DEFAULT_ADMIN`: Address that will have admin role
- `PAUSER`: Address that will have pauser role

### 2. Deploy to Celo Sepolia Testnet

**Recommended: Use the deployment script**

```bash
./deploy.sh
```

This script will:
- ✅ Validate your environment variables
- ✅ Compile your contracts
- ✅ Deploy both implementation and proxy
- ✅ Show you the deployed addresses

### 3. Manual Deployment (Alternative)

If you prefer to run commands manually:

```bash
# Load environment variables
source .env

# Deploy using forge script
forge script script/DeployGigipay.s.sol:DeployGigipay \
  --rpc-url celo-sepolia \
  --private-key $PRIVATE_KEY \
  --broadcast \
  -vvvv
```

## Verify Deployment

After deployment, you'll see output like:
```
Gigipay Implementation deployed at: 0x...
Gigipay Proxy deployed at: 0x...
```

**Important**: Users should interact with the **Proxy address**, not the implementation!

## Troubleshooting

### SSL Certificate Error
If you see `invalid peer certificate: UnknownIssuer`, try:
1. Use a different RPC endpoint
2. Update your system's CA certificates: `sudo update-ca-certificates`

### RPC Connection Issues
- Verify the RPC URL is correct and accessible
- Check if the RPC endpoint requires an API key
- Try alternative RPC endpoints from [Celo docs](https://docs.celo.org/network/node/forno)

## Post-Deployment

1. **Save the proxy address** - this is what users will interact with
2. **Verify the contract** on Celoscan for transparency
3. **Test basic functions** before announcing
4. **Revoke/Rotate the deployer private key** if it was exposed
