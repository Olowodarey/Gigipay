# 🚀 Gigipay Deployment Guide

## Prerequisites

Before deploying, make sure you have:

1. **Foundry installed** - Run `forge --version` to check
2. **Your wallet private key** - Export from MetaMask or your wallet
3. **ETH/CELO for gas** - Ensure you have enough for deployment
4. **Your wallet address** - This will be the admin

## Setup Steps

### 1. Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit the .env file
nano .env
```

### 2. Fill in Your Details

In the `.env` file, replace:

- `PRIVATE_KEY` - Your wallet's private key (⚠️ KEEP THIS SECRET!)
- `DEFAULT_ADMIN` - Your wallet address (you'll be the owner)
- `PAUSER` - Your wallet address (or a different address for emergency pausing)

**Example:**

```bash
PRIVATE_KEY=abc123def456...  # Your actual private key
DEFAULT_ADMIN=0x1234567890abcdef1234567890abcdef12345678  # Your wallet
PAUSER=0x1234567890abcdef1234567890abcdef12345678  # Same or different
```

### 3. Deploy to Base Mainnet

```bash
# Make the script executable
chmod +x deploy-base-mainnet.sh

# Run deployment
./deploy-base-mainnet.sh
```

### 4. Deploy to Celo Mainnet

```bash
# Make the script executable
chmod +x deploy-mainnet.sh

# Run deployment
./deploy-mainnet.sh
```

## What Happens During Deployment

1. **Compiles** the updated Gigipay contract
2. **Deploys** the implementation contract
3. **Deploys** a proxy contract
4. **Initializes** the proxy with YOUR wallet as admin
5. **Verifies** the contract on the block explorer (if API key provided)

## After Deployment

You'll see output like:

```
Gigipay Implementation deployed at: 0xABC...
Gigipay Proxy deployed at: 0xDEF...
```

**⚠️ IMPORTANT:**

- Save the **PROXY address** - this is what users interact with
- Update your frontend with the new proxy address
- The proxy address is the one you'll use in your app

## Your Admin Powers

As the admin (DEFAULT_ADMIN), you can:

✅ **Pause the contract** - Stop all operations in an emergency
✅ **Unpause the contract** - Resume operations
✅ **Grant roles** - Add more admins or pausers
✅ **Revoke roles** - Remove admins or pausers

## Testing Your Deployment

After deployment, test with a small transaction:

1. Create a small voucher (e.g., 0.01 ETH/CELO)
2. Claim it with the code
3. Verify the transaction on the block explorer

## Security Tips

🔒 **NEVER share your private key**
🔒 **Keep your .env file secure** (it's in .gitignore)
🔒 **Use a hardware wallet** for production deployments
🔒 **Test on testnet first** before mainnet

## Troubleshooting

**"Insufficient funds"**

- Make sure you have enough ETH/CELO for gas

**"Contract verification failed"**

- Add your BASESCAN_API_KEY or CELOSCAN_API_KEY to .env
- Or verify manually on the block explorer

**"Private key error"**

- Make sure your private key has no 0x prefix
- Check that .env file is in the contracts directory

## Need Help?

- Check deployment logs for errors
- Verify your .env configuration
- Ensure you have the latest contract code compiled
