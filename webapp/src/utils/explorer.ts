/**
 * Block Explorer Utilities
 *
 * Provides functions to generate block explorer URLs for transactions,
 * addresses, and blocks on supported networks.
 */

// Chain ID to Block Explorer URL mapping
const EXPLORER_URLS: Record<number, string> = {
  1: 'https://etherscan.io',           // Ethereum Mainnet
  11155111: 'https://sepolia.etherscan.io', // Sepolia Testnet
  5: 'https://goerli.etherscan.io',    // Goerli Testnet (deprecated)
  137: 'https://polygonscan.com',       // Polygon Mainnet
  80001: 'https://mumbai.polygonscan.com', // Polygon Mumbai
};

/**
 * Get the block explorer base URL for a given chain ID
 */
export const getExplorerUrl = (chainId: number): string => {
  return EXPLORER_URLS[chainId] || EXPLORER_URLS[11155111]; // Default to Sepolia
};

/**
 * Generate a transaction URL for the block explorer
 */
export const getTransactionUrl = (txHash: string, chainId: number = 11155111): string => {
  const baseUrl = getExplorerUrl(chainId);
  return `${baseUrl}/tx/${txHash}`;
};

/**
 * Generate an address URL for the block explorer
 */
export const getAddressUrl = (address: string, chainId: number = 11155111): string => {
  const baseUrl = getExplorerUrl(chainId);
  return `${baseUrl}/address/${address}`;
};

/**
 * Generate a block URL for the block explorer
 */
export const getBlockUrl = (blockNumber: number, chainId: number = 11155111): string => {
  const baseUrl = getExplorerUrl(chainId);
  return `${baseUrl}/block/${blockNumber}`;
};

/**
 * Shorten a transaction hash or address for display
 */
export const shortenHash = (hash: string, chars: number = 6): string => {
  if (!hash) return '';
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
};

/**
 * Get the explorer name for a given chain ID
 */
export const getExplorerName = (chainId: number): string => {
  switch (chainId) {
    case 1:
      return 'Etherscan';
    case 11155111:
      return 'Sepolia Etherscan';
    case 5:
      return 'Goerli Etherscan';
    case 137:
      return 'Polygonscan';
    case 80001:
      return 'Mumbai Polygonscan';
    default:
      return 'Block Explorer';
  }
};
