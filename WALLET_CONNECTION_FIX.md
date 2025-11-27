# 🔧 Fix Browser Wallet Connection

## Issue
Your wallet connection modal shows MetaMask, Rainbow, Base Account, and WalletConnect, but your browser extension wallet (like MetaMask, Coinbase Wallet, etc.) is not being detected.

## ✅ Solution

### Step 1: Get a WalletConnect Project ID

1. Go to https://cloud.walletconnect.com/
2. Sign up or log in
3. Create a new project
4. Copy your Project ID

### Step 2: Create `.env.local` file

Create a file at `/home/olowo/Desktop/Payflow/apps/web/.env.local`:

```bash
# WalletConnect Project ID (get from https://cloud.walletconnect.com/)
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_actual_project_id_here
```

Replace `your_actual_project_id_here` with your real Project ID.

### Step 3: Restart Your Dev Server

```bash
cd /home/olowo/Desktop/Payflow/apps/web
npm run dev
```

### Step 4: Clear Browser Cache

1. Open your browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"

---

## 🔍 Why This Happens

RainbowKit's `getDefaultConfig` automatically detects browser extension wallets (MetaMask, Coinbase Wallet, etc.), but it needs a valid WalletConnect Project ID to initialize properly.

Without a valid Project ID, the wallet detection might not work correctly.

---

## 🎯 What Should Happen After Fix

After following the steps above, when you click "Connect Wallet", you should see:

**Popular Section:**
- **Browser Wallet** (your installed extension - MetaMask, Coinbase, etc.)
- Rainbow
- MetaMask (WalletConnect version)
- WalletConnect

The "Browser Wallet" option will connect directly to your browser extension.

---

## 🔄 Alternative: Use MetaMask Directly

If you see "MetaMask" in the list (even without Browser Wallet), you can:

1. Click "MetaMask"
2. It will show a QR code
3. Click "Don't have MetaMask?" or look for "Browser Extension" option
4. Or simply install MetaMask extension and refresh

---

## 🐛 Still Not Working?

### Check 1: Is Your Wallet Extension Installed?
- Open your browser extensions
- Make sure MetaMask (or your wallet) is installed and enabled
- Try disabling/re-enabling the extension

### Check 2: Is Your Wallet on the Correct Network?
- Open your wallet extension
- Switch to Celo Sepolia network
- Chain ID: 44787 or 11142220
- RPC: https://forno.celo-sepolia.celo-testnet.org/

### Check 3: Browser Compatibility
- RainbowKit works best on Chrome, Brave, Firefox, Edge
- Make sure you're not in incognito/private mode
- Try a different browser

### Check 4: Console Errors
1. Open DevTools (F12)
2. Go to Console tab
3. Look for any errors related to wallet connection
4. Share the errors if you need help

---

## 📱 Manual Network Setup

If your wallet doesn't have Celo Sepolia, add it manually:

**Network Name:** Celo Sepolia  
**RPC URL:** https://forno.celo-sepolia.celo-testnet.org/  
**Chain ID:** 44787 (or 11142220)  
**Currency Symbol:** CELO  
**Block Explorer:** https://alfajores.celoscan.io  

---

## 🎉 Quick Test

After fixing, test the connection:

1. Click "Connect Wallet"
2. Select your browser wallet
3. Approve the connection
4. You should see your address in the navbar
5. Try creating a voucher or batch payment

---

## 💡 Pro Tips

1. **Always use a valid WalletConnect Project ID** - it's free and takes 2 minutes
2. **Keep your wallet extension updated** - old versions may have issues
3. **Use testnet CELO** - get free tokens from https://faucet.celo.org/
4. **Check network** - make sure you're on Celo Sepolia (Chain ID: 44787)

---

Need more help? Check the RainbowKit docs: https://www.rainbowkit.com/docs/installation
