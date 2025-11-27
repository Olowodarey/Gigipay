# 🎉 Gigipay Contract Setup Complete!

## 📋 Deployment Summary

### Contract Addresses (Celo Sepolia Testnet)

**🎯 Main Contract (Proxy) - USE THIS ONE:**
```
0xc9ccBb9821Fdda9c51C8c992e8352b221e7CEd91
```

**Implementation Contract (for reference):**
```
0xedA3b2C3c43aAE98dF94bf8149b96407C026931c
```

### View on Block Explorer

- **Celoscan:** https://alfajores.celoscan.io/address/0xc9ccBb9821Fdda9c51C8c992e8352b221e7CEd91
- **Blockscout:** https://celo-alfajores.blockscout.com/address/0xc9ccBb9821Fdda9c51C8c992e8352b221e7CEd91

### Network Details

- **Network:** Celo Sepolia Testnet (Alfajores)
- **Chain ID:** 44787 (or 11142220 - both work)
- **RPC URL:** https://forno.celo-sepolia.celo-testnet.org/
- **Currency:** CELO

---

## 🔧 Frontend Integration Complete

### Updated Files

#### 1. **Contract Configuration** (`apps/web/src/lib/contracts/batchTransfer.ts`)
- ✅ Updated contract address to new Gigipay proxy
- ✅ Replaced ABI with complete Gigipay ABI
- ✅ Added all voucher functions
- ✅ Includes batch transfer functionality

#### 2. **New Voucher Hooks** (`apps/web/src/hooks/useVouchers.ts`)
Created comprehensive hooks for all voucher operations:

**Write Operations:**
- `useCreateVoucher()` - Create single voucher
- `useCreateVoucherBatch()` - Create multiple vouchers
- `useClaimVoucher()` - Claim a voucher with code
- `useRefundVoucher()` - Refund expired voucher

**Read Operations:**
- `useVoucherDetails(voucherId)` - Get voucher info
- `useSenderVouchers(address)` - Get all vouchers by sender
- `useIsVoucherClaimable(voucherId)` - Check if claimable
- `useIsVoucherRefundable(voucherId)` - Check if refundable

#### 3. **Existing Hooks Still Work**
- `useBatchTransfer()` - Batch payments (CELO & ERC20)
- `useContractPaused()` - Check contract status
- `useTokenApproval()` - ERC20 approvals
- `useTokenAllowance()` - Check allowances
- `useTokenBalance()` - Check token balances

---

## 🚀 How to Use in Your Frontend

### Example 1: Create a Voucher

```typescript
import { useCreateVoucher } from '@/hooks/useVouchers';

function CreateVoucherComponent() {
  const { createVoucher, isPending, isConfirmed, hash } = useCreateVoucher();

  const handleCreate = async () => {
    // Create voucher with 10 CELO, expires in 7 days
    const expirationTime = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
    await createVoucher("SECRET123", "10", expirationTime);
  };

  return (
    <button onClick={handleCreate} disabled={isPending}>
      {isPending ? 'Creating...' : 'Create Voucher'}
    </button>
  );
}
```

### Example 2: Claim a Voucher

```typescript
import { useClaimVoucher } from '@/hooks/useVouchers';

function ClaimVoucherComponent() {
  const { claimVoucher, isPending, isConfirmed } = useClaimVoucher();

  const handleClaim = async () => {
    await claimVoucher(0, "SECRET123"); // voucherId: 0, claimCode: "SECRET123"
  };

  return (
    <button onClick={handleClaim} disabled={isPending}>
      {isPending ? 'Claiming...' : 'Claim Voucher'}
    </button>
  );
}
```

### Example 3: View Your Vouchers

```typescript
import { useSenderVouchers, useVoucherDetails } from '@/hooks/useVouchers';
import { useAccount } from 'wagmi';
import { formatUnits } from 'viem';

function MyVouchersComponent() {
  const { address } = useAccount();
  const { voucherIds, isLoading } = useSenderVouchers(address);

  return (
    <div>
      <h2>My Vouchers</h2>
      {voucherIds.map((id) => (
        <VoucherCard key={id.toString()} voucherId={Number(id)} />
      ))}
    </div>
  );
}

function VoucherCard({ voucherId }: { voucherId: number }) {
  const { voucher } = useVoucherDetails(voucherId);
  
  if (!voucher) return null;

  return (
    <div>
      <p>Amount: {formatUnits(voucher.amount, 18)} CELO</p>
      <p>Status: {voucher.claimed ? 'Claimed' : voucher.refunded ? 'Refunded' : 'Active'}</p>
      <p>Expires: {new Date(Number(voucher.expiresAt) * 1000).toLocaleDateString()}</p>
    </div>
  );
}
```

### Example 4: Batch Transfer (Already Working)

```typescript
import { useBatchTransfer } from '@/hooks/useBatchTransfer';
import { TOKEN_ADDRESSES } from '@/lib/contracts/batchTransfer';

function BatchPaymentComponent() {
  const { executeBatchTransfer, isPending } = useBatchTransfer();

  const handleBatchPay = async () => {
    const recipients = [
      { address: '0x123...', amount: '10' },
      { address: '0x456...', amount: '20' },
    ];
    
    await executeBatchTransfer(TOKEN_ADDRESSES.CELO, recipients, 18);
  };

  return (
    <button onClick={handleBatchPay} disabled={isPending}>
      Send Batch Payment
    </button>
  );
}
```

---

## 📦 Contract Features Available

### 1. **Payment Vouchers**
- Create vouchers with claim codes
- Set expiration times
- Batch create multiple vouchers
- Claim with secret code
- Refund expired vouchers

### 2. **Batch Transfers**
- Send native CELO to multiple recipients
- Send ERC20 tokens (cUSD, USDC, cEUR) to multiple recipients
- Gas-efficient batch operations

### 3. **Access Control**
- Pausable contract (admin only)
- Role-based permissions
- Upgradeable via proxy pattern

---

## 🧪 Testing Your Integration

### 1. Get Testnet CELO
Visit: https://faucet.celo.org/
- Select "Alfajores Testnet"
- Enter your wallet address
- Get free testnet CELO

### 2. Test Voucher Creation
1. Connect your wallet to Celo Sepolia
2. Create a voucher with a small amount (e.g., 0.1 CELO)
3. Note the voucher ID from the transaction
4. Try claiming it with the claim code

### 3. Test Batch Transfer
1. Prepare a list of recipient addresses
2. Execute batch transfer
3. Verify recipients received funds

---

## 📝 Important Notes

1. **Always use the Proxy address** (`0xc9ccBb9821Fdda9c51C8c992e8352b221e7CEd91`) for all interactions
2. **Claim codes are case-sensitive** - store them securely
3. **Vouchers expire** - set reasonable expiration times
4. **Gas optimization** - use batch functions when possible
5. **ERC20 tokens require approval** before batch transfer

---

## 🔐 Security Reminders

- ✅ Contract is deployed and initialized
- ✅ Admin role set to: `0x778DB78469FE2341917317c8aD32552E9C085409`
- ✅ Contract is upgradeable (can fix bugs)
- ✅ Contract is pausable (emergency stop)
- ⚠️ This is a TESTNET deployment - don't use real funds

---

## 📚 Additional Resources

- **Celo Docs:** https://docs.celo.org
- **Wagmi Docs:** https://wagmi.sh
- **Viem Docs:** https://viem.sh
- **Contract Source:** `apps/contracts/src/Gigipay.sol`

---

## 🎯 Next Steps

1. ✅ Contract deployed
2. ✅ Frontend integrated
3. 🔲 Build voucher UI components
4. 🔲 Test all features on testnet
5. 🔲 Verify contract on block explorer
6. 🔲 Deploy to mainnet (when ready)

---

**Need help?** Check the contract source code or the hooks for detailed implementation examples!
