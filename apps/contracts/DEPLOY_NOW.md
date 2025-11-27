# 🚀 Deploy Gigipay Now - Quick Guide

## Step 1: Create Your .env File

```bash
cp .env.example .env
nano .env
```

Fill in these values:
```env
PRIVATE_KEY=your_private_key_without_0x_prefix
DEFAULT_ADMIN=0xYourAdminAddress
PAUSER=0xYourPauserAddress
```

**💡 Tip**: Use the same address for both DEFAULT_ADMIN and PAUSER if you want one address to control everything.

## Step 2: Deploy!

```bash
./deploy.sh
```

That's it! The script handles everything.

## What Gets Deployed?

1. **Implementation Contract**: The actual Gigipay logic
2. **Proxy Contract**: The upgradeable proxy that users interact with

**⚠️ IMPORTANT**: Users should use the **PROXY ADDRESS**, not the implementation!

## Expected Output

You should see something like:
```
🚀 Deploying Gigipay to Celo Sepolia Testnet...

📋 Deployment Configuration:
  Network: Celo Sepolia Testnet
  RPC: celo-sepolia (from foundry.toml)
  Default Admin: 0x...
  Pauser: 0x...

🔨 Compiling contracts...
[⠊] Compiling...
Compiler run successful!

📤 Deploying contracts...
...
Gigipay Implementation deployed at: 0xIMPLEMENTATION_ADDRESS
Gigipay Proxy deployed at: 0xPROXY_ADDRESS
...

✅ Deployment complete!
```

## After Deployment

1. **Save the Proxy Address** - This is what you'll share with users
2. **Test the contract** - Try creating a voucher on testnet
3. **Verify on Celoscan** - Make your contract source code public

## Troubleshooting

### "Error: .env file not found"
Run: `cp .env.example .env` and fill in your values

### "Error: PRIVATE_KEY not set"
Make sure your `.env` file has `PRIVATE_KEY=...` with your actual key

### "insufficient funds"
Your deployer address needs CELO tokens on Sepolia testnet. Get some from the [Celo Faucet](https://faucet.celo.org/).

### SSL/Certificate errors
The new RPC endpoint (`https://forno.celo-sepolia.celo-testnet.org/`) should fix this!

## Network Details

- **Network**: Celo Sepolia Testnet
- **Chain ID**: 44787
- **RPC**: https://forno.celo-sepolia.celo-testnet.org/
- **Explorer**: https://celo-alfajores.blockscout.com/
- **Faucet**: https://faucet.celo.org/

## Need Testnet Tokens?

Visit: https://faucet.celo.org/
- Select "Alfajores Testnet" (same as Sepolia)
- Enter your address
- Get free testnet CELO
