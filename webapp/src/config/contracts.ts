import { getAddress, ZeroAddress } from 'ethers';

const FALLBACK_ADDRESS = ZeroAddress;

export const SUPPORTED_CHAIN_ID = 11155111; // Sepolia

export const getSupplyLedgerAddress = (chainId?: number): `0x${string}` => {
  if (chainId !== SUPPORTED_CHAIN_ID) {
    return FALLBACK_ADDRESS;
  }

  const envAddress = import.meta.env.VITE_SUPPLY_LEDGER_ADDRESS as string | undefined;

  if (!envAddress) {
    return FALLBACK_ADDRESS;
  }

  try {
    return getAddress(envAddress);
  } catch (error) {
    console.warn('[config] invalid VITE_SUPPLY_LEDGER_ADDRESS', error);
    return FALLBACK_ADDRESS;
  }
};

export const isSupportedChain = (chainId?: number) => chainId === SUPPORTED_CHAIN_ID;
