import { createPublicClient, http, type Address, type Chain } from "viem";
import { baseSepolia, base } from "viem/chains";
import { createSmartAccountClient } from "permissionless";
import { privateKeyToAccount } from "viem/accounts";
import { createPimlicoClient } from "permissionless/clients/pimlico";
import { toSimpleSmartAccount } from "permissionless/accounts";

// EntryPoint v0.7 address (standard across all EVM chains)
const ENTRYPOINT_ADDRESS_V07 =
  "0x0000000071727De22E5E9d8BAf0edAc6f37da032" as const;

/**
 * Get the Paymaster URL from environment variables
 */
export function getPaymasterUrl(): string {
  const url = process.env.NEXT_PUBLIC_PAYMASTER_URL;
  if (!url || url.includes("your_api_key_here")) {
    throw new Error(
      "NEXT_PUBLIC_PAYMASTER_URL is not configured. Please add your CDP API key to .env.local",
    );
  }
  return url;
}

/**
 * Get the chain configuration based on environment
 * Defaults to Base mainnet for production
 */
export function getChain(): Chain {
  const paymasterUrl = getPaymasterUrl();
  // Check if using testnet based on URL, otherwise use mainnet
  if (paymasterUrl.includes("base-sepolia")) {
    return baseSepolia;
  }
  return base; // Base mainnet (default)
}

/**
 * Create a public client for reading blockchain data
 */
export function createPublicClientForChain(chain: Chain) {
  return createPublicClient({
    chain,
    transport: http(getPaymasterUrl()),
  });
}

/**
 * Create a Pimlico bundler client for submitting UserOperations
 * CDP combines Paymaster and Bundler in one endpoint
 */
export function createBundlerClient(chain: Chain) {
  return createPimlicoClient({
    chain,
    transport: http(getPaymasterUrl()),
    entryPoint: {
      address: ENTRYPOINT_ADDRESS_V07,
      version: "0.7",
    },
  });
}

/**
 * Create a smart account from a private key (owner)
 * This creates a SimpleAccount implementation
 *
 * @param ownerPrivateKey - The private key of the account owner (EOA)
 * @param chain - The blockchain network to use
 */
export async function createSmartAccount(
  ownerPrivateKey: `0x${string}`,
  chain: Chain,
) {
  const publicClient = createPublicClientForChain(chain);
  const owner = privateKeyToAccount(ownerPrivateKey);

  // Create a simple smart account
  const simpleAccount = await toSimpleSmartAccount({
    client: publicClient,
    owner,
    entryPoint: {
      address: ENTRYPOINT_ADDRESS_V07,
      version: "0.7",
    },
  });

  return simpleAccount;
}

/**
 * Create a smart account client with Paymaster support
 * This client can send sponsored transactions
 *
 * @param ownerPrivateKey - The private key of the account owner
 * @param chain - The blockchain network to use
 */
export async function createSmartAccountClientWithPaymaster(
  ownerPrivateKey: `0x${string}`,
  chain: Chain,
) {
  const smartAccount = await createSmartAccount(ownerPrivateKey, chain);
  const bundlerClient = createBundlerClient(chain);

  // Create smart account client with Paymaster
  const smartAccountClient = createSmartAccountClient({
    account: smartAccount,
    chain,
    bundlerTransport: http(getPaymasterUrl()),
    paymaster: bundlerClient,
    userOperation: {
      estimateFeesPerGas: async () => {
        return (await bundlerClient.getUserOperationGasPrice()).fast;
      },
    },
  });

  return smartAccountClient;
}

/**
 * Get smart account address without creating full client
 * Useful for displaying the address before transactions
 */
export async function getSmartAccountAddress(
  ownerPrivateKey: `0x${string}`,
  chain: Chain,
): Promise<Address> {
  const smartAccount = await createSmartAccount(ownerPrivateKey, chain);
  return smartAccount.address;
}
