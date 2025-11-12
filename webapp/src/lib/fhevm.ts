import { getAddress, hexlify } from 'ethers';

/**
 * FHE SDK Wrapper using Zama's CDN-loaded Relayer SDK
 *
 * This module uses the SDK loaded via script tag in index.html:
 * https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs
 */

declare global {
  interface Window {
    RelayerSDK?: any;
    relayerSDK?: any;
    ethereum?: any;
    okxwallet?: any;
  }
}

let fheInstance: any = null;

/**
 * Get the SDK from window object
 */
const getSDK = () => {
  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires a browser environment');
  }
  const sdk = window.RelayerSDK || window.relayerSDK;
  if (!sdk) {
    throw new Error(
      'Relayer SDK not loaded. Ensure the CDN script tag is present in index.html.'
    );
  }
  return sdk;
};

/**
 * Check if SDK is loaded from CDN
 */
export const isSDKLoaded = (): boolean => {
  if (typeof window === 'undefined') return false;
  return !!(window.RelayerSDK || window.relayerSDK);
};

/**
 * Wait for FHE SDK to be loaded (with timeout)
 */
export const waitForSDK = async (timeoutMs: number = 10000): Promise<boolean> => {
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    if (isSDKLoaded()) {
      return true;
    }
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  return false;
};

/**
 * Initialize FHE instance using Zama's CDN SDK
 */
export const initializeFHEVM = async (provider?: any): Promise<any> => {
  if (fheInstance) {
    console.log('[FHE] Instance already initialized');
    return fheInstance;
  }

  if (typeof window === 'undefined') {
    throw new Error('FHE SDK requires a browser environment');
  }

  // Get ethereum provider
  const ethereumProvider =
    provider || window.ethereum || window.okxwallet?.provider || window.okxwallet;

  if (!ethereumProvider) {
    throw new Error('No wallet provider detected. Connect a wallet first.');
  }

  try {
    // Wait for SDK to be loaded if not ready
    if (!isSDKLoaded()) {
      console.log('[FHE] Waiting for SDK to load from CDN...');
      const loaded = await waitForSDK(15000);
      if (!loaded) {
        throw new Error('FHE SDK failed to load from CDN within timeout');
      }
    }

    console.log('[FHE] SDK loaded, initializing...');
    const sdk = getSDK();
    const { initSDK, createInstance, SepoliaConfig } = sdk;

    console.log('[FHE] Initializing WASM...');
    await initSDK();

    const config = {
      ...SepoliaConfig,
      network: ethereumProvider,
    };

    console.log('[FHE] Creating instance...');
    fheInstance = await createInstance(config);
    console.log('[FHE] ✅ Instance initialized successfully');

    return fheInstance;
  } catch (error) {
    console.error('[FHE] ❌ Initialization failed:', error);
    fheInstance = null;
    throw new Error(`FHE initialization failed: ${error}`);
  }
};

/**
 * Get the current FHE instance
 */
export const getFHEVMInstance = (): any => {
  return fheInstance;
};

/**
 * Reset FHE instance
 */
export const resetFHEVM = (): void => {
  fheInstance = null;
  console.log('[FHE] Instance reset');
};

/**
 * Check if FHE is initialized
 */
export const isFHEInitialized = (): boolean => {
  return fheInstance !== null;
};

/**
 * Get FHE status for debugging
 */
export const getFHEStatus = (): {
  sdkLoaded: boolean;
  instanceReady: boolean;
} => {
  return {
    sdkLoaded: isSDKLoaded(),
    instanceReady: fheInstance !== null,
  };
};

/**
 * Ensure FHE instance is initialized
 */
const ensureInstance = async (provider?: any) => {
  let fhe = getFHEVMInstance();
  if (!fhe) {
    fhe = await initializeFHEVM(provider);
  }
  if (!fhe) throw new Error('Failed to initialize FHE instance');
  return fhe;
};

/**
 * Encrypt a uint64 value using FHE
 */
export const encryptUint64 = async (
  value: number | bigint,
  contractAddress: string,
  userAddress: string,
  provider?: any
): Promise<{ data: string; proof: string }> => {
  const fhe = await ensureInstance(provider);
  const contractAddressChecksum = getAddress(contractAddress);
  const userAddressChecksum = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input for uint64...');
  const input = fhe.createEncryptedInput(contractAddressChecksum, userAddressChecksum);
  input.add64(BigInt(value));

  console.log('[FHE] Encrypting uint64 value...');
  const { handles, inputProof } = await input.encrypt();

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  console.log('[FHE] ✅ uint64 encryption successful');
  return { data: handle, proof };
};

/**
 * Encrypt a uint32 value using FHE
 */
export const encryptUint32 = async (
  value: number,
  contractAddress: string,
  userAddress: string,
  provider?: any
): Promise<{ data: string; proof: string }> => {
  const fhe = await ensureInstance(provider);
  const contractAddressChecksum = getAddress(contractAddress);
  const userAddressChecksum = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input for uint32...');
  const input = fhe.createEncryptedInput(contractAddressChecksum, userAddressChecksum);
  input.add32(value);

  console.log('[FHE] Encrypting uint32 value...');
  const { handles, inputProof } = await input.encrypt();

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  console.log('[FHE] ✅ uint32 encryption successful');
  return { data: handle, proof };
};

/**
 * Encrypt a uint16 value using FHE
 */
export const encryptUint16 = async (
  value: number,
  contractAddress: string,
  userAddress: string,
  provider?: any
): Promise<{ data: string; proof: string }> => {
  const fhe = await ensureInstance(provider);
  const contractAddressChecksum = getAddress(contractAddress);
  const userAddressChecksum = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input for uint16...');
  const input = fhe.createEncryptedInput(contractAddressChecksum, userAddressChecksum);
  input.add16(value);

  console.log('[FHE] Encrypting uint16 value...');
  const { handles, inputProof } = await input.encrypt();

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  console.log('[FHE] ✅ uint16 encryption successful');
  return { data: handle, proof };
};

/**
 * Encrypt a uint8 value using FHE
 */
export const encryptUint8 = async (
  value: number,
  contractAddress: string,
  userAddress: string,
  provider?: any
): Promise<{ data: string; proof: string }> => {
  const fhe = await ensureInstance(provider);
  const contractAddressChecksum = getAddress(contractAddress);
  const userAddressChecksum = getAddress(userAddress);

  console.log('[FHE] Creating encrypted input for uint8...');
  const input = fhe.createEncryptedInput(contractAddressChecksum, userAddressChecksum);
  input.add8(value);

  console.log('[FHE] Encrypting uint8 value...');
  const { handles, inputProof } = await input.encrypt();

  if (handles.length < 1) {
    throw new Error('FHE SDK returned insufficient handles');
  }

  const handle = hexlify(handles[0]);
  const proof = hexlify(inputProof);

  console.log('[FHE] ✅ uint8 encryption successful');
  return { data: handle, proof };
};

/**
 * Helper to convert encrypted data to contract input format
 */
export const toContractInput = (encrypted: string): string => {
  return encrypted;
};

/**
 * Helper to generate proof bytes for contract
 */
export const toProofBytes = (proof: string): string => proof;

/**
 * Request decryption of an encrypted value
 */
export const publicDecrypt = async (handle: string): Promise<number> => {
  const fhe = getFHEVMInstance();
  if (!fhe) throw new Error('FHE not initialized');

  try {
    console.log('[FHE] Requesting decryption...');
    const values = await fhe.publicDecrypt([handle]);
    const decryptedValue = Number(values[handle]);
    console.log('[FHE] ✅ Decryption successful');
    return decryptedValue;
  } catch (error: any) {
    console.error('[FHE] ❌ Decryption failed:', error);
    throw error;
  }
};
