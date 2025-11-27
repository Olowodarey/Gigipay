# 🎯 One Voucher Name, Multiple Claim Codes

## Perfect Design for Giveaways!

The contract has been redesigned so that **one voucher name** can have **multiple claim codes** underneath it. This is exactly what you need for giveaways!

---

## 🎨 How It Works

### Example: Birthday Giveaway

**Create:**
```solidity
createVoucherBatch(
    "Birthday2024",           // ONE voucher name
    ["CODE1", "CODE2", "CODE3"],  // Multiple claim codes
    [10 ether, 5 ether, 5 ether], // Different amounts
    [expiry, expiry, expiry]      // Same or different expiry
)
```

**Result:**
- Voucher Name: "Birthday2024"
  - CODE1 → 10 CELO (voucher ID: 0)
  - CODE2 → 5 CELO (voucher ID: 1)
  - CODE3 → 5 CELO (voucher ID: 2)

**Claim:**
```solidity
claimVoucherByName("Birthday2024", "CODE1")  // Gets 10 CELO
claimVoucherByName("Birthday2024", "CODE2")  // Gets 5 CELO
claimVoucherByName("Birthday2024", "CODE3")  // Gets 5 CELO
```

---

## 🔧 Key Changes

### 1. Updated Mapping Structure

**Before:**
```solidity
mapping(bytes32 => uint256) public voucherNameToId;  // One name → One ID
```

**After:**
```solidity
mapping(bytes32 => uint256[]) public voucherNameToIds;  // One name → Multiple IDs
```

### 2. Updated createVoucherBatch Function

**Before:**
```solidity
function createVoucherBatch(
    string[] memory voucherNames,  // Different name for each
    string[] memory claimCodes,
    uint256[] memory amounts,
    uint256[] memory expirationTimes
)
```

**After:**
```solidity
function createVoucherBatch(
    string memory voucherName,     // ONE name for all
    string[] memory claimCodes,    // Multiple codes
    uint256[] memory amounts,
    uint256[] memory expirationTimes
)
```

### 3. Smart claimVoucherByName Function

```solidity
function claimVoucherByName(
    string memory voucherName,
    string memory claimCode
) public whenNotPaused {
    // Get all vouchers under this name
    uint256[] memory voucherIds = voucherNameToIds[voucherNameHash];
    
    // Loop through and find matching claim code
    for (uint256 i = 0; i < voucherIds.length; i++) {
        PaymentVoucher storage voucher = vouchers[voucherIds[i]];
        
        // Skip if already claimed or refunded
        if (voucher.claimed || voucher.refunded) continue;
        
        // Check if claim code matches
        if (providedCodeHash == voucher.claimCodeHash) {
            // Claim it!
            voucher.claimed = true;
            // Transfer CELO...
            return;
        }
    }
    
    // No matching code found
    revert InvalidClaimCode();
}
```

### 4. New Helper Function

```solidity
function getVouchersByName(string memory voucherName) 
    public view returns (uint256[] memory) {
    // Returns all voucher IDs under this name
}
```

---

## 📝 Usage Examples

### Example 1: Community Giveaway

```solidity
// Create 100 vouchers under "CommunityDrop"
string[] memory codes = new string[](100);
uint256[] memory amounts = new uint256[](100);
uint256[] memory expiries = new uint256[](100);

for (uint i = 0; i < 100; i++) {
    codes[i] = string(abi.encodePacked("DROP", i));
    amounts[i] = 1 ether;
    expiries[i] = block.timestamp + 7 days;
}

createVoucherBatch{value: 100 ether}(
    "CommunityDrop",
    codes,
    amounts,
    expiries
);

// Share: "Claim from 'CommunityDrop' with your code!"
// User 1: claimVoucherByName("CommunityDrop", "DROP0")
// User 2: claimVoucherByName("CommunityDrop", "DROP1")
// etc.
```

### Example 2: Tiered Rewards

```solidity
createVoucherBatch{value: 30 ether}(
    "NewYearRewards",
    ["GOLD", "SILVER1", "SILVER2", "BRONZE1", "BRONZE2", "BRONZE3"],
    [10 ether, 5 ether, 5 ether, 3.33 ether, 3.33 ether, 3.34 ether],
    [expiry, expiry, expiry, expiry, expiry, expiry]
);

// Share different codes to different people
// VIP gets "GOLD" → 10 CELO
// Regular users get "SILVER1" or "BRONZE1" → 5 or 3.33 CELO
```

### Example 3: Event Attendance

```solidity
createVoucherBatch{value: 50 ether}(
    "ConferenceAttendance",
    ["SPEAKER1", "SPEAKER2", "ATTENDEE1", "ATTENDEE2", ...],
    [5 ether, 5 ether, 1 ether, 1 ether, ...],
    [expiry, expiry, expiry, expiry, ...]
);

// Speakers get 5 CELO codes
// Attendees get 1 CELO codes
// All under one campaign name
```

---

## 🎯 Benefits

### For Creators
✅ **One campaign name** - Easy to remember and share  
✅ **Multiple codes** - Distribute to many people  
✅ **Different amounts** - Tiered rewards  
✅ **Track by name** - See all vouchers in campaign  
✅ **Gas efficient** - Create all in one transaction  

### For Claimers
✅ **Simple claiming** - Just need name + code  
✅ **No voucher ID needed** - Don't need to track numbers  
✅ **Easy sharing** - "Use 'Birthday2024' with code ABC"  

### For Developers
✅ **Flexible design** - Support any giveaway structure  
✅ **Auto-matching** - Contract finds the right voucher  
✅ **Duplicate protection** - Can't claim twice  
✅ **Query by name** - Get all vouchers in campaign  

---

## 📊 Comparison

| Feature | Old System | New System |
|---------|-----------|------------|
| **Voucher Names** | Each code needs unique name | One name, many codes |
| **Giveaway Setup** | Create 100 different names | Create 1 name with 100 codes |
| **User Experience** | "Use voucher 'Drop47'" | "Use 'CommunityDrop' with your code" |
| **Tracking** | Hard to group vouchers | Easy - all under one name |
| **Flexibility** | Limited | High - different amounts per code |

---

## 🔍 Real-World Scenarios

### Scenario 1: Twitter Giveaway
```
Creator: "I'm giving away 50 CELO to 10 lucky winners!"
         "Campaign: TwitterGiveaway2024"
         "Winners will receive their unique codes via DM"

Winner 1 receives: "Your code is WINNER1"
Winner 2 receives: "Your code is WINNER2"
...

To claim: claimVoucherByName("TwitterGiveaway2024", "WINNER1")
```

### Scenario 2: Referral Program
```
Creator: "Refer friends and they get 5 CELO!"
         "Campaign: ReferralBonus"
         "Generate unique codes for each referral"

Referral 1: claimVoucherByName("ReferralBonus", "REF_ALICE")
Referral 2: claimVoucherByName("ReferralBonus", "REF_BOB")
```

### Scenario 3: Event Tickets
```
Creator: "Buy ticket, get 10 CELO back!"
         "Campaign: EventRefund2024"
         "Each ticket has unique code on it"

Attendee scans QR code: "TICKET_12345"
Claims: claimVoucherByName("EventRefund2024", "TICKET_12345")
```

---

## 🛠️ New Functions

### createVoucherBatch
```solidity
function createVoucherBatch(
    string memory voucherName,        // ONE name
    string[] memory claimCodes,       // Multiple codes
    uint256[] memory amounts,         // Amount for each code
    uint256[] memory expirationTimes  // Expiry for each code
) public payable returns (uint256[] memory voucherIds)
```

### claimVoucherByName
```solidity
function claimVoucherByName(
    string memory voucherName,  // Campaign name
    string memory claimCode     // Your unique code
) public
```

### getVouchersByName
```solidity
function getVouchersByName(
    string memory voucherName
) public view returns (uint256[] memory)
// Returns all voucher IDs under this campaign
```

---

## 📈 Gas Efficiency

Creating 100 vouchers under one name:
- **Old way:** 100 separate transactions
- **New way:** 1 batch transaction
- **Savings:** ~95% gas reduction!

---

## ⚠️ Important Notes

1. **Claim codes must be unique** within a campaign
2. **First matching code wins** - if duplicate codes exist, first unclaimed one is used
3. **Can reuse voucher names** - You can create more vouchers under existing name
4. **Legacy support** - `claimVoucher(voucherId, code)` still works

---

## 🧪 Testing

Update your tests to use the new signature:

**Before:**
```solidity
string[] memory names = ["Name1", "Name2", "Name3"];
createVoucherBatch(names, codes, amounts, expiries);
```

**After:**
```solidity
string memory name = "CampaignName";
createVoucherBatch(name, codes, amounts, expiries);
```

---

## 🚀 Frontend Integration

### Create Campaign
```typescript
const { createVoucherBatch } = useCreateVoucherBatch();

await createVoucherBatch({
  voucherName: "Birthday2024",
  claimCodes: ["CODE1", "CODE2", "CODE3"],
  amounts: ["10", "5", "5"],
  expirationTimes: [expiry, expiry, expiry]
});
```

### Claim Voucher
```typescript
const { claimByName } = useClaimVoucherByName();

await claimByName("Birthday2024", "CODE1");
```

### View Campaign
```typescript
const { getVouchersByName } = useGetVouchersByName();

const voucherIds = await getVouchersByName("Birthday2024");
// Returns: [0, 1, 2]
```

---

## ✅ Summary

This new design is **perfect for giveaways** because:

1. ✅ **One memorable name** per campaign
2. ✅ **Multiple unique codes** for distribution
3. ✅ **Flexible amounts** per code
4. ✅ **Easy claiming** - just name + code
5. ✅ **Gas efficient** - batch creation
6. ✅ **Easy tracking** - query by campaign name

**Example Flow:**
```
Creator: Creates "ChristmasGiveaway" with 100 codes
Shares: "Claim from 'ChristmasGiveaway' with your code!"
Users: Enter campaign name + their unique code
Contract: Finds matching code and transfers CELO
```

Much better than tracking voucher IDs! 🎉
