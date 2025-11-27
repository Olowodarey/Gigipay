import { Address } from 'viem';

/**
 * Gigipay Contract Configuration
 * Deployed on Celo Sepolia Testnet (Alfajores)
 * Proxy Address: 0xc9ccBb9821Fdda9c51C8c992e8352b221e7CEd91
 * Implementation: 0xedA3b2C3c43aAE98dF94bf8149b96407C026931c
 */
export const BATCH_TRANSFER_CONTRACT = {
  address: '0xc9ccBb9821Fdda9c51C8c992e8352b221e7CEd91' as Address,
  abi: [
    { inputs: [], stateMutability: 'nonpayable', type: 'constructor' },
    { inputs: [], name: 'AccessControlBadConfirmation', type: 'error' },
    { inputs: [{ internalType: 'address', name: 'account', type: 'address' }, { internalType: 'bytes32', name: 'neededRole', type: 'bytes32' }], name: 'AccessControlUnauthorizedAccount', type: 'error' },
    { inputs: [], name: 'EmptyArray', type: 'error' },
    { inputs: [], name: 'EnforcedPause', type: 'error' },
    { inputs: [], name: 'ExpectedPause', type: 'error' },
    { inputs: [], name: 'IncorrectNativeAmount', type: 'error' },
    { inputs: [], name: 'InsufficientAllowance', type: 'error' },
    { inputs: [], name: 'InvalidAmount', type: 'error' },
    { inputs: [], name: 'InvalidClaimCode', type: 'error' },
    { inputs: [], name: 'InvalidExpirationTime', type: 'error' },
    { inputs: [], name: 'InvalidInitialization', type: 'error' },
    { inputs: [], name: 'InvalidRecipient', type: 'error' },
    { inputs: [], name: 'LengthMismatch', type: 'error' },
    { inputs: [], name: 'NotInitializing', type: 'error' },
    { inputs: [{ internalType: 'address', name: 'token', type: 'address' }], name: 'SafeERC20FailedOperation', type: 'error' },
    { inputs: [], name: 'TransferFailed', type: 'error' },
    { inputs: [], name: 'VoucherAlreadyClaimed', type: 'error' },
    { inputs: [], name: 'VoucherAlreadyRefunded', type: 'error' },
    { inputs: [], name: 'VoucherExpired', type: 'error' },
    { inputs: [], name: 'VoucherNotExpired', type: 'error' },
    { inputs: [], name: 'VoucherNotFound', type: 'error' },
    { anonymous: false, inputs: [{ indexed: true, internalType: 'address', name: 'sender', type: 'address' }, { indexed: true, internalType: 'address', name: 'token', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'totalAmount', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'recipientCount', type: 'uint256' }], name: 'BatchTransferCompleted', type: 'event' },
    { anonymous: false, inputs: [{ indexed: false, internalType: 'uint64', name: 'version', type: 'uint64' }], name: 'Initialized', type: 'event' },
    { anonymous: false, inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }], name: 'Paused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' }, { indexed: true, internalType: 'bytes32', name: 'previousAdminRole', type: 'bytes32' }, { indexed: true, internalType: 'bytes32', name: 'newAdminRole', type: 'bytes32' }], name: 'RoleAdminChanged', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' }, { indexed: true, internalType: 'address', name: 'account', type: 'address' }, { indexed: true, internalType: 'address', name: 'sender', type: 'address' }], name: 'RoleGranted', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, internalType: 'bytes32', name: 'role', type: 'bytes32' }, { indexed: true, internalType: 'address', name: 'account', type: 'address' }, { indexed: true, internalType: 'address', name: 'sender', type: 'address' }], name: 'RoleRevoked', type: 'event' },
    { anonymous: false, inputs: [{ indexed: false, internalType: 'address', name: 'account', type: 'address' }], name: 'Unpaused', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, internalType: 'uint256', name: 'voucherId', type: 'uint256' }, { indexed: true, internalType: 'address', name: 'claimer', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'VoucherClaimed', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, internalType: 'uint256', name: 'voucherId', type: 'uint256' }, { indexed: true, internalType: 'address', name: 'sender', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }, { indexed: false, internalType: 'uint256', name: 'expiresAt', type: 'uint256' }], name: 'VoucherCreated', type: 'event' },
    { anonymous: false, inputs: [{ indexed: true, internalType: 'uint256', name: 'voucherId', type: 'uint256' }, { indexed: true, internalType: 'address', name: 'sender', type: 'address' }, { indexed: false, internalType: 'uint256', name: 'amount', type: 'uint256' }], name: 'VoucherRefunded', type: 'event' },
    { inputs: [], name: 'DEFAULT_ADMIN_ROLE', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'PAUSER_ROLE', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function' },
    { inputs: [{ internalType: 'address', name: 'token', type: 'address' }, { internalType: 'address[]', name: 'recipients', type: 'address[]' }, { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }], name: 'batchTransfer', outputs: [], stateMutability: 'payable', type: 'function' },
    { inputs: [{ internalType: 'uint256', name: 'voucherId', type: 'uint256' }, { internalType: 'string', name: 'claimCode', type: 'string' }], name: 'claimVoucher', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [{ internalType: 'string', name: 'claimCode', type: 'string' }, { internalType: 'uint256', name: 'expirationTime', type: 'uint256' }], name: 'createVoucher', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'payable', type: 'function' },
    { inputs: [{ internalType: 'string[]', name: 'claimCodes', type: 'string[]' }, { internalType: 'uint256[]', name: 'amounts', type: 'uint256[]' }, { internalType: 'uint256[]', name: 'expirationTimes', type: 'uint256[]' }], name: 'createVoucherBatch', outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }], stateMutability: 'payable', type: 'function' },
    { inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }], name: 'getRoleAdmin', outputs: [{ internalType: 'bytes32', name: '', type: 'bytes32' }], stateMutability: 'view', type: 'function' },
    { inputs: [{ internalType: 'address', name: 'sender', type: 'address' }], name: 'getSenderVouchers', outputs: [{ internalType: 'uint256[]', name: '', type: 'uint256[]' }], stateMutability: 'view', type: 'function' },
    { inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, { internalType: 'address', name: 'account', type: 'address' }], name: 'grantRole', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, { internalType: 'address', name: 'account', type: 'address' }], name: 'hasRole', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
    { inputs: [{ internalType: 'address', name: 'defaultAdmin', type: 'address' }, { internalType: 'address', name: 'pauser', type: 'address' }], name: 'initialize', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [{ internalType: 'uint256', name: 'voucherId', type: 'uint256' }], name: 'isVoucherClaimable', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
    { inputs: [{ internalType: 'uint256', name: 'voucherId', type: 'uint256' }], name: 'isVoucherRefundable', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'pause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [], name: 'paused', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
    { inputs: [{ internalType: 'uint256', name: 'voucherId', type: 'uint256' }], name: 'refundVoucher', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, { internalType: 'address', name: 'callerConfirmation', type: 'address' }], name: 'renounceRole', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [{ internalType: 'bytes32', name: 'role', type: 'bytes32' }, { internalType: 'address', name: 'account', type: 'address' }], name: 'revokeRole', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [{ internalType: 'address', name: '', type: 'address' }, { internalType: 'uint256', name: '', type: 'uint256' }], name: 'senderVouchers', outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], stateMutability: 'view', type: 'function' },
    { inputs: [{ internalType: 'bytes4', name: 'interfaceId', type: 'bytes4' }], name: 'supportsInterface', outputs: [{ internalType: 'bool', name: '', type: 'bool' }], stateMutability: 'view', type: 'function' },
    { inputs: [], name: 'unpause', outputs: [], stateMutability: 'nonpayable', type: 'function' },
    { inputs: [{ internalType: 'uint256', name: '', type: 'uint256' }], name: 'vouchers', outputs: [{ internalType: 'address', name: 'sender', type: 'address' }, { internalType: 'uint256', name: 'amount', type: 'uint256' }, { internalType: 'bytes32', name: 'claimCodeHash', type: 'bytes32' }, { internalType: 'uint256', name: 'expiresAt', type: 'uint256' }, { internalType: 'bool', name: 'claimed', type: 'bool' }, { internalType: 'bool', name: 'refunded', type: 'bool' }], stateMutability: 'view', type: 'function' },
    { stateMutability: 'payable', type: 'receive' },
  ] as const,
} as const;

/**
 * ERC20 Token addresses on Celo Sepolia Testnet
 */
export const TOKEN_ADDRESSES = {
  CELO: '0x0000000000000000000000000000000000000000' as Address, // Native CELO (use address(0))
  cUSD: '0x4822e58de6f5e485eF90df51C41CE01721331dC0' as Address, // Sepolia cUSD
  cEUR: '0x8E8f9d7A0C0B4B0e8B4B0e8B4B0e8B4B0e8B4B0e' as Address, // Sepolia cEUR (placeholder)
  cREAL: '0x9E9f9d7A0C0B4B0e8B4B0e8B4B0e8B4B0e8B4B0e' as Address, // Sepolia cREAL (placeholder)
  USDC: '0x2F25deB3848C207fc8E0c34035B3Ba7fC157602B' as Address, // Sepolia USDC (placeholder)
  USDT: '0x48065fbBE25f71C9282ddf5e1cD6D6A887483D5e' as Address, // Placeholder
} as const;

export type TokenSymbol = keyof typeof TOKEN_ADDRESSES;
