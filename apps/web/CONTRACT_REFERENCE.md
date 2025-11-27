# Gigipay Contract Quick Reference

## 📍 Contract Address
```
0xc9ccBb9821Fdda9c51C8c992e8352b221e7CEd91
```
**Network:** Celo Sepolia (Chain ID: 44787)

---

## 🎫 Voucher Functions

### Create Voucher
```typescript
createVoucher(claimCode: string, expirationTime: number)
// Payable - send CELO value
// Returns: voucherId
```

### Create Voucher Batch
```typescript
createVoucherBatch(
  claimCodes: string[],
  amounts: bigint[],
  expirationTimes: bigint[]
)
// Payable - send total CELO value
// Returns: voucherId[]
```

### Claim Voucher
```typescript
claimVoucher(voucherId: number, claimCode: string)
// Transfers CELO to caller
```

### Refund Voucher
```typescript
refundVoucher(voucherId: number)
// Only sender can refund
// Only after expiration
```

### Get Voucher Details
```typescript
vouchers(voucherId: number)
// Returns: {
//   sender: address,
//   amount: bigint,
//   claimCodeHash: bytes32,
//   expiresAt: bigint,
//   claimed: boolean,
//   refunded: boolean
// }
```

### Get Sender Vouchers
```typescript
getSenderVouchers(sender: address)
// Returns: voucherId[]
```

### Check Voucher Status
```typescript
isVoucherClaimable(voucherId: number) // Returns: boolean
isVoucherRefundable(voucherId: number) // Returns: boolean
```

---

## 💸 Batch Transfer Functions

### Batch Transfer
```typescript
batchTransfer(
  token: address,        // Use 0x0...0 for native CELO
  recipients: address[],
  amounts: bigint[]
)
// Payable for CELO transfers
// Requires approval for ERC20 tokens
```

---

## 🔐 Admin Functions

### Pause Contract
```typescript
pause()
// Requires PAUSER_ROLE
```

### Unpause Contract
```typescript
unpause()
// Requires PAUSER_ROLE
```

### Check Paused Status
```typescript
paused() // Returns: boolean
```

---

## 📊 View Functions

### Get Roles
```typescript
DEFAULT_ADMIN_ROLE() // Returns: bytes32
PAUSER_ROLE()        // Returns: bytes32
```

### Check Role
```typescript
hasRole(role: bytes32, account: address) // Returns: boolean
```

---

## 🎨 Frontend Hook Reference

### Voucher Hooks
```typescript
import {
  useCreateVoucher,
  useCreateVoucherBatch,
  useClaimVoucher,
  useRefundVoucher,
  useVoucherDetails,
  useSenderVouchers,
  useIsVoucherClaimable,
  useIsVoucherRefundable,
} from '@/hooks/useVouchers';
```

### Batch Transfer Hooks
```typescript
import {
  useBatchTransfer,
  useContractPaused,
} from '@/hooks/useBatchTransfer';
```

### Token Hooks
```typescript
import {
  useTokenApproval,
  useTokenAllowance,
  useTokenBalance,
} from '@/hooks/useTokenApproval';
```

---

## 💰 Token Addresses (Celo Sepolia)

```typescript
import { TOKEN_ADDRESSES } from '@/lib/contracts/batchTransfer';

TOKEN_ADDRESSES.CELO  // 0x0000000000000000000000000000000000000000
TOKEN_ADDRESSES.cUSD  // 0x4822e58de6f5e485eF90df51C41CE01721331dC0
TOKEN_ADDRESSES.USDC  // 0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B
TOKEN_ADDRESSES.cEUR  // (placeholder)
```

---

## 🔍 Events

### VoucherCreated
```typescript
event VoucherCreated(
  uint256 indexed voucherId,
  address indexed sender,
  uint256 amount,
  uint256 expiresAt
)
```

### VoucherClaimed
```typescript
event VoucherClaimed(
  uint256 indexed voucherId,
  address indexed claimer,
  uint256 amount
)
```

### VoucherRefunded
```typescript
event VoucherRefunded(
  uint256 indexed voucherId,
  address indexed sender,
  uint256 amount
)
```

### BatchTransferCompleted
```typescript
event BatchTransferCompleted(
  address indexed sender,
  address indexed token,
  uint256 totalAmount,
  uint256 recipientCount
)
```

---

## ⚠️ Error Types

- `InvalidAmount` - Amount is zero or invalid
- `InvalidClaimCode` - Wrong or empty claim code
- `InvalidExpirationTime` - Expiration in the past
- `VoucherNotFound` - Voucher doesn't exist
- `VoucherAlreadyClaimed` - Already claimed
- `VoucherAlreadyRefunded` - Already refunded
- `VoucherExpired` - Past expiration time
- `VoucherNotExpired` - Can't refund yet
- `TransferFailed` - Transfer failed
- `IncorrectNativeAmount` - Wrong CELO amount sent
- `InsufficientAllowance` - Need token approval
- `InvalidRecipient` - Zero address recipient
- `LengthMismatch` - Array lengths don't match
- `EmptyArray` - Empty recipient array
- `EnforcedPause` - Contract is paused

---

## 📱 Example Usage Patterns

### Pattern 1: Create & Share Voucher
```typescript
// 1. Create voucher
const { createVoucher } = useCreateVoucher();
const expiresIn7Days = Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);
await createVoucher("MYSECRET", "5", expiresIn7Days);

// 2. Share voucherId and claimCode with recipient
// 3. Recipient claims
const { claimVoucher } = useClaimVoucher();
await claimVoucher(voucherId, "MYSECRET");
```

### Pattern 2: Batch Payment
```typescript
// 1. For ERC20: Approve first
const { approve } = useTokenApproval(TOKEN_ADDRESSES.cUSD);
await approve("100", 18);

// 2. Execute batch transfer
const { executeBatchTransfer } = useBatchTransfer();
await executeBatchTransfer(
  TOKEN_ADDRESSES.cUSD,
  [
    { address: '0x123...', amount: '50' },
    { address: '0x456...', amount: '50' },
  ],
  18
);
```

### Pattern 3: Manage Vouchers
```typescript
// Get all your vouchers
const { address } = useAccount();
const { voucherIds } = useSenderVouchers(address);

// Check each voucher
voucherIds.forEach(async (id) => {
  const { voucher } = useVoucherDetails(Number(id));
  const { isRefundable } = useIsVoucherRefundable(Number(id));
  
  if (isRefundable) {
    // Refund expired voucher
    const { refundVoucher } = useRefundVoucher();
    await refundVoucher(Number(id));
  }
});
```

---

## 🌐 Block Explorer Links

- **View Contract:** https://alfajores.celoscan.io/address/0xc9ccBb9821Fdda9c51C8c992e8352b221e7CEd91
- **View Transactions:** Add `/txs` to the URL above
- **Read Contract:** Add `#readContract` to the URL above
- **Write Contract:** Add `#writeContract` to the URL above
