# 🎯 Voucher Name System - Contract Update

## Problem Identified

The original voucher system had a critical UX issue:
- Users needed to know the exact **voucher ID** (0, 1, 2, etc.) to claim
- No way to identify which voucher a claim code belongs to
- Difficult to share vouchers ("Use voucher ID 47 with code ABC123")

## ✅ Solution: Voucher Names

Added a **voucher name system** that allows users to create and claim vouchers using memorable names instead of numeric IDs.

---

## 🔧 Contract Changes

### 1. Updated PaymentVoucher Struct

**Before:**
```solidity
struct PaymentVoucher {
    address sender;
    uint256 amount;
    bytes32 claimCodeHash;
    uint256 expiresAt;
    bool claimed;
    bool refunded;
}
```

**After:**
```solidity
struct PaymentVoucher {
    address sender;
    uint256 amount;
    bytes32 claimCodeHash;
    uint256 expiresAt;
    bool claimed;
    bool refunded;
    string voucherName; // NEW: Name/identifier for the voucher
}
```

### 2. Added New Mappings

```solidity
// Map voucher name hash to voucher ID for easy lookup
mapping(bytes32 => uint256) public voucherNameToId;

// Track if a voucher name is already used (prevent duplicates)
mapping(bytes32 => bool) public voucherNameExists;
```

### 3. Updated createVoucher Function

**Before:**
```solidity
function createVoucher(
    string memory claimCode,
    uint256 expirationTime
) public payable returns (uint256)
```

**After:**
```solidity
function createVoucher(
    string memory voucherName,  // NEW: Required voucher name
    string memory claimCode,
    uint256 expirationTime
) public payable returns (uint256)
```

**Features:**
- ✅ Requires unique voucher name
- ✅ Prevents duplicate names
- ✅ Maps name to voucher ID automatically

### 4. Updated createVoucherBatch Function

**Before:**
```solidity
function createVoucherBatch(
    string[] memory claimCodes,
    uint256[] memory amounts,
    uint256[] memory expirationTimes
) public payable returns (uint256[] memory)
```

**After:**
```solidity
function createVoucherBatch(
    string[] memory voucherNames,  // NEW: Array of voucher names
    string[] memory claimCodes,
    uint256[] memory amounts,
    uint256[] memory expirationTimes
) public payable returns (uint256[] memory)
```

### 5. NEW: claimVoucherByName Function

```solidity
/**
 * @notice Claim a payment voucher using voucher name and claim code
 * @param voucherName The name of the voucher to claim
 * @param claimCode The secret code to unlock the voucher
 */
function claimVoucherByName(
    string memory voucherName,
    string memory claimCode
) public whenNotPaused
```

**How it works:**
1. User provides voucher name (e.g., "Birthday2024")
2. Contract looks up voucher ID from name
3. Validates claim code
4. Transfers CELO to claimer

### 6. Kept Legacy claimVoucher Function

```solidity
function claimVoucher(
    uint256 voucherId,
    string memory claimCode
) public whenNotPaused
```

**Why keep it?**
- Backwards compatibility
- Some users may prefer using voucher ID
- Allows both methods to coexist

---

## 📝 Usage Examples

### Creating a Voucher

**Old Way (won't work anymore):**
```solidity
createVoucher("SECRET123", expirationTime)
// Returns: voucherId = 0
```

**New Way:**
```solidity
createVoucher("Birthday2024", "SECRET123", expirationTime)
// Returns: voucherId = 0
// Name "Birthday2024" is now mapped to ID 0
```

### Claiming a Voucher

**Method 1: By Name (Recommended)**
```solidity
claimVoucherByName("Birthday2024", "SECRET123")
// Much easier to remember and share!
```

**Method 2: By ID (Legacy)**
```solidity
claimVoucher(0, "SECRET123")
// Still works, but less user-friendly
```

### Batch Creation

**Old Way:**
```solidity
createVoucherBatch(
    ["CODE1", "CODE2", "CODE3"],
    [1 ether, 2 ether, 3 ether],
    [expiry1, expiry2, expiry3]
)
```

**New Way:**
```solidity
createVoucherBatch(
    ["Giveaway1", "Giveaway2", "Giveaway3"],  // Voucher names
    ["CODE1", "CODE2", "CODE3"],               // Claim codes
    [1 ether, 2 ether, 3 ether],              // Amounts
    [expiry1, expiry2, expiry3]                // Expiration times
)
```

---

## 🎯 Benefits

### For Users
✅ **Memorable names** instead of numbers (Birthday2024 vs voucher ID 47)  
✅ **Easy sharing** ("Use voucher 'Christmas2024' with code ABC")  
✅ **No confusion** about which voucher to claim  
✅ **Better UX** for giveaways and promotions  

### For Developers
✅ **Unique names** enforced at contract level  
✅ **Fast lookups** using hash mapping  
✅ **Backwards compatible** with ID-based claiming  
✅ **Gas efficient** name-to-ID mapping  

---

## ⚠️ Breaking Changes

### Contract Functions Changed

1. **`createVoucher`** - Now requires `voucherName` as first parameter
2. **`createVoucherBatch`** - Now requires `voucherNames` array as first parameter

### Migration Required

If you have existing code calling these functions, you need to update:

**Before:**
```typescript
await createVoucher(claimCode, expirationTime, { value: amount });
```

**After:**
```typescript
await createVoucher(voucherName, claimCode, expirationTime, { value: amount });
```

---

## 🚀 Next Steps

### 1. Redeploy Contract

Since this changes the contract structure, you need to:

```bash
cd apps/contracts
./deploy.sh
```

**Note:** This will deploy a NEW contract. The old one cannot be upgraded to add the voucher name field to existing vouchers.

### 2. Update Frontend

Update your frontend hooks and components to use voucher names:

**Create Voucher Hook:**
```typescript
// OLD
await createVoucher(claimCode, expirationTime);

// NEW
await createVoucher(voucherName, claimCode, expirationTime);
```

**Claim Voucher Hook:**
```typescript
// Add new hook for claiming by name
export function useClaimVoucherByName() {
  const { writeContract, ... } = useWriteContract();
  
  const claimByName = async (voucherName: string, claimCode: string) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'claimVoucherByName',
      args: [voucherName, claimCode],
    });
  };
  
  return { claimByName, ... };
}
```

### 3. Update UI

**Create Payment Page:**
- Add "Voucher Name" input field
- Validate name is unique
- Show name in confirmation

**Claim Payment Page:**
- Replace "Voucher ID" with "Voucher Name"
- Change input type from number to text
- Update placeholder: "e.g., Birthday2024"

---

## 📊 Comparison

| Feature | Old System | New System |
|---------|-----------|------------|
| **Identifier** | Numeric ID (0, 1, 2...) | Named (Birthday2024) |
| **User-Friendly** | ❌ Hard to remember | ✅ Easy to remember |
| **Sharing** | "Use voucher 47" | "Use voucher Birthday2024" |
| **Uniqueness** | Auto-incremented | Enforced unique names |
| **Lookup** | Direct by ID | Hash-based name lookup |
| **Backwards Compatible** | N/A | ✅ Yes (ID still works) |

---

## 🔍 Example User Flow

### Creating a Giveaway

**Creator:**
1. Goes to /create-payment
2. Enters:
   - Voucher Name: "NewYear2025"
   - Claim Code: "HAPPY2025"
   - Amount: 10 CELO
   - Expiry: 7 days
3. Creates voucher
4. Shares: "Claim 10 CELO using voucher 'NewYear2025' with code HAPPY2025"

### Claiming the Giveaway

**Claimer:**
1. Goes to /claim-payment
2. Enters:
   - Voucher Name: "NewYear2025"
   - Claim Code: "HAPPY2025"
3. Clicks "Claim Payment"
4. Receives 10 CELO instantly!

**Much better than:**
"Claim voucher ID 47 with code HAPPY2025" ❌

---

## 💡 Best Practices

### Voucher Naming

**Good Names:**
- ✅ "Birthday2024"
- ✅ "ChristmasGiveaway"
- ✅ "CommunityReward_Jan"
- ✅ "Welcome_Bonus"

**Bad Names:**
- ❌ "v1" (too generic)
- ❌ "test" (not descriptive)
- ❌ "abc123" (confusing)
- ❌ "" (empty - will revert)

### Security

- **Voucher names are public** - anyone can see them
- **Claim codes are secret** - keep them private
- **Use unique names** - contract enforces this
- **Case sensitive** - "Birthday2024" ≠ "birthday2024"

---

## 🐛 Error Handling

The contract will revert with `InvalidClaimCode` if:
- Voucher name is empty
- Voucher name already exists
- Claim code is empty
- Claim code is incorrect

---

## ✅ Summary

This update makes the voucher system **much more user-friendly** by allowing memorable names instead of numeric IDs. Users can now easily create and share vouchers with names like "Birthday2024" instead of "voucher ID 47".

**Action Required:**
1. Redeploy contract with new changes
2. Update frontend to use voucher names
3. Test the new claim-by-name functionality

The old claim-by-ID method still works for backwards compatibility!
