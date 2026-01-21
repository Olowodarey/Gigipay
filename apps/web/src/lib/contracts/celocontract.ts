import { Address } from "viem";

/**
 * Gigipay Contract Configuration
 * Deployed on Celo Mainnet
 * Contract Address: 0x95c59Cd8d42440692Bcb07b207DF2deBa688e77c
 */
export const BATCH_TRANSFER_CONTRACT = {
  address: "0x7B7750Fb5f0ce9C908fCc0674F8B35782F6d40B3" as Address,
  abi: [
    { inputs: [], stateMutability: "nonpayable", type: "constructor" },
    { inputs: [], name: "AccessControlBadConfirmation", type: "error" },
    {
      inputs: [
        { internalType: "address", name: "account", type: "address" },
        { internalType: "bytes32", name: "neededRole", type: "bytes32" },
      ],
      name: "AccessControlUnauthorizedAccount",
      type: "error",
    },
    { inputs: [], name: "EmptyArray", type: "error" },
    { inputs: [], name: "EnforcedPause", type: "error" },
    { inputs: [], name: "ExpectedPause", type: "error" },
    { inputs: [], name: "IncorrectNativeAmount", type: "error" },
    { inputs: [], name: "InsufficientAllowance", type: "error" },
    { inputs: [], name: "InvalidAmount", type: "error" },
    { inputs: [], name: "InvalidClaimCode", type: "error" },
    { inputs: [], name: "InvalidExpirationTime", type: "error" },
    { inputs: [], name: "InvalidInitialization", type: "error" },
    { inputs: [], name: "InvalidRecipient", type: "error" },
    { inputs: [], name: "LengthMismatch", type: "error" },
    { inputs: [], name: "NotInitializing", type: "error" },
    {
      inputs: [{ internalType: "address", name: "token", type: "address" }],
      name: "SafeERC20FailedOperation",
      type: "error",
    },
    { inputs: [], name: "TransferFailed", type: "error" },
    { inputs: [], name: "VoucherAlreadyClaimed", type: "error" },
    { inputs: [], name: "VoucherAlreadyRefunded", type: "error" },
    { inputs: [], name: "VoucherExpired", type: "error" },
    { inputs: [], name: "VoucherNotExpired", type: "error" },
    { inputs: [], name: "VoucherNotFound", type: "error" },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "token",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "totalAmount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "recipientCount",
          type: "uint256",
        },
      ],
      name: "BatchTransferCompleted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint64",
          name: "version",
          type: "uint64",
        },
      ],
      name: "Initialized",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Paused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "previousAdminRole",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "bytes32",
          name: "newAdminRole",
          type: "bytes32",
        },
      ],
      name: "RoleAdminChanged",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "RoleGranted",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "bytes32",
          name: "role",
          type: "bytes32",
        },
        {
          indexed: true,
          internalType: "address",
          name: "account",
          type: "address",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
      ],
      name: "RoleRevoked",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
      name: "Unpaused",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "voucherId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "claimer",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "VoucherClaimed",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "voucherId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "expiresAt",
          type: "uint256",
        },
      ],
      name: "VoucherCreated",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "voucherId",
          type: "uint256",
        },
        {
          indexed: true,
          internalType: "address",
          name: "sender",
          type: "address",
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256",
        },
      ],
      name: "VoucherRefunded",
      type: "event",
    },
    {
      inputs: [],
      name: "DEFAULT_ADMIN_ROLE",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "PAUSER_ROLE",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "token", type: "address" },
        { internalType: "address[]", name: "recipients", type: "address[]" },
        { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
      ],
      name: "batchTransfer",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "string", name: "voucherName", type: "string" },
        { internalType: "string", name: "claimCode", type: "string" },
      ],
      name: "claimVoucher",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "token", type: "address" },
        { internalType: "string", name: "voucherName", type: "string" },
        { internalType: "string[]", name: "claimCodes", type: "string[]" },
        { internalType: "uint256[]", name: "amounts", type: "uint256[]" },
        {
          internalType: "uint256[]",
          name: "expirationTimes",
          type: "uint256[]",
        },
      ],
      name: "createVoucherBatch",
      outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
      stateMutability: "payable",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "role", type: "bytes32" }],
      name: "getRoleAdmin",
      outputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "address", name: "sender", type: "address" }],
      name: "getSenderVouchers",
      outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "voucherName", type: "string" }],
      name: "getVouchersByName",
      outputs: [{ internalType: "uint256[]", name: "", type: "uint256[]" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "role", type: "bytes32" },
        { internalType: "address", name: "account", type: "address" },
      ],
      name: "grantRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "role", type: "bytes32" },
        { internalType: "address", name: "account", type: "address" },
      ],
      name: "hasRole",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "defaultAdmin", type: "address" },
        { internalType: "address", name: "pauser", type: "address" },
      ],
      name: "initialize",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "voucherId", type: "uint256" }],
      name: "isVoucherClaimable",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "voucherId", type: "uint256" }],
      name: "isVoucherRefundable",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "pause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [],
      name: "paused",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "string", name: "voucherName", type: "string" }],
      name: "refundVouchersByName",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "role", type: "bytes32" },
        {
          internalType: "address",
          name: "callerConfirmation",
          type: "address",
        },
      ],
      name: "renounceRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "role", type: "bytes32" },
        { internalType: "address", name: "account", type: "address" },
      ],
      name: "revokeRole",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        { internalType: "address", name: "", type: "address" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      name: "senderVouchers",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes4", name: "interfaceId", type: "bytes4" }],
      name: "supportsInterface",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [],
      name: "unpause",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [{ internalType: "bytes32", name: "", type: "bytes32" }],
      name: "voucherNameExists",
      outputs: [{ internalType: "bool", name: "", type: "bool" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [
        { internalType: "bytes32", name: "", type: "bytes32" },
        { internalType: "uint256", name: "", type: "uint256" },
      ],
      name: "voucherNameToIds",
      outputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      stateMutability: "view",
      type: "function",
    },
    {
      inputs: [{ internalType: "uint256", name: "", type: "uint256" }],
      name: "vouchers",
      outputs: [
        { internalType: "address", name: "sender", type: "address" },
        { internalType: "address", name: "token", type: "address" },
        { internalType: "uint256", name: "amount", type: "uint256" },
        { internalType: "bytes32", name: "claimCodeHash", type: "bytes32" },
        { internalType: "uint256", name: "expiresAt", type: "uint256" },
        { internalType: "bool", name: "claimed", type: "bool" },
        { internalType: "bool", name: "refunded", type: "bool" },
        { internalType: "string", name: "voucherName", type: "string" },
      ],
      stateMutability: "view",
      type: "function",
    },
    { stateMutability: "payable", type: "receive" },
  ] as const,
} as const;

/**
 * ERC20 Token addresses on Celo Mainnet
 */
export const TOKEN_ADDRESSES = {
  CELO: "0x0000000000000000000000000000000000000000" as Address, // Native CELO (use address(0))
  cUSD: "0x765DE816845861e75A25fCA122bb6898B8B1282a" as Address, // Mainnet cUSD
  cEUR: "0xD8763CBa276a3738E6DE85b4b3bF5FDed6D6cA73" as Address, // Mainnet cEUR
  cREAL: "0xe8537a3d056DA446677B9E9d6c5dB704EaAb4787" as Address, // Mainnet cREAL
  USDC: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C" as Address, // Mainnet USDC
  USDT: "0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e" as Address, // Mainnet USDT
} as const;

export type TokenSymbol = keyof typeof TOKEN_ADDRESSES;
