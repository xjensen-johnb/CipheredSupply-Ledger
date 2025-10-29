import { useAccount, usePublicClient, useWalletClient } from 'wagmi';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  BrowserProvider,
  Contract,
  ZeroAddress,
  encodeBytes32String,
  getAddress,
  isHexString,
} from 'ethers';

import { getSupplyLedgerAddress, isSupportedChain } from '@/config/contracts';
import {
  encryptUint64,
  initializeFHEVM,
  isFHEInitialized,
  toContractInput,
  toProofBytes,
} from '@/lib/fhevm';

// Ultra-simplified ABI - only encrypts VALUE (1 parameter)
export const ULTRA_SIMPLIFIED_SUPPLY_LEDGER_ABI = [
  'constructor()',
  'function owner() view returns (address)',
  'function authorizeCarrier(address carrier)',
  'function submitShipment(bytes32 shipmentId, address carrier, address receiver, (uint256,bytes32) encryptedValue, bytes valueProof, uint256 weightKg, uint256 quantity, uint256 riskCode, uint256 temperature, uint256 humidity, uint256 priority, string category) returns (bytes32)',
  'function startTransit(bytes32 shipmentId)',
  'function markDelivered(bytes32 shipmentId)',
  'function markLost(bytes32 shipmentId)',
  'function calculateInsurancePremium(bytes32 shipmentId) returns ((uint256,bytes32))',
  'function getShipmentInfo(bytes32 shipmentId) view returns (address shipper, address carrier, address receiver, string category, uint8 status, uint256 submittedAt, uint256 deliveredAt, bool isActive, uint256 weightKg, uint256 quantity, uint256 riskCode, uint256 temperature, uint256 humidity, uint256 priority)',
  'function getSupplyStats() view returns (uint256 totalShipments, uint256 delivered, uint256 active)',
  'function isCarrier(address account) view returns (bool)',
  'function isInspector(address account) view returns (bool)',
  'event ShipmentSubmitted(bytes32 indexed shipmentId, address indexed shipper, address indexed carrier, string category, uint256 timestamp)',
];

export const SHIPMENT_STATUS = [
  'Draft',
  'Submitted',
  'InTransit',
  'Delivered',
  'Lost',
] as const;

export interface UltraSimplifiedShipmentFormValues {
  shipmentId: string;
  carrier: string;
  receiver: string;
  // Only 1 encrypted parameter
  declaredValue: number;
  // All other parameters in plaintext
  weightKg: number;
  quantity: number;
  riskCode: number;
  temperature: number;
  humidity: number;
  priority: number;
  category: string;
}

export interface UltraSimplifiedShipmentInfo {
  shipmentId: `0x${string}`;
  shipper: string;
  carrier: string;
  receiver: string;
  category: string;
  statusIndex: number;
  statusLabel: string;
  submittedAt: number;
  deliveredAt: number;
  isActive: boolean;
  weightKg: number;
  quantity: number;
  riskCode: number;
  temperature: number;
  humidity: number;
  priority: number;
}

const normalizeShipmentId = (input: string): `0x${string}` => {
  if (!input || input.trim().length === 0) {
    throw new Error('Shipment ID is required');
  }

  const trimmed = input.trim();
  if (isHexString(trimmed, 32)) {
    return trimmed as `0x${string}`;
  }

  if (trimmed.length > 31) {
    throw new Error('Shipment ID must be <= 31 characters or a 32-byte hex string');
  }

  return encodeBytes32String(trimmed) as `0x${string}`;
};

export const useUltraSimplifiedSupplyLedger = () => {
  const { address, chain } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [contract, setContract] = useState<Contract | null>(null);
  const [contractAddress, setContractAddress] = useState<`0x${string}`>(ZeroAddress);
  const [initializing, setInitializing] = useState(false);

  const isWrongNetwork = useMemo(
    () => (chain ? !isSupportedChain(chain.id) : false),
    [chain]
  );

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      if (!walletClient || !chain || !address) {
        setContract(null);
        setContractAddress(ZeroAddress);
        return;
      }

      if (!isSupportedChain(chain.id)) {
        setContract(null);
        setContractAddress(ZeroAddress);
        return;
      }

      // Get the ultra-simplified contract address from env
      const targetAddress = import.meta.env.VITE_ULTRA_SIMPLIFIED_SUPPLY_LEDGER_ADDRESS;

      if (!targetAddress || targetAddress === ZeroAddress) {
        console.warn('[UltraSimplifiedSupplyLedger] contract address not configured');
        setContract(null);
        setContractAddress(ZeroAddress);
        return;
      }

      setInitializing(true);
      try {
        const provider = new BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        const instance = new Contract(targetAddress, ULTRA_SIMPLIFIED_SUPPLY_LEDGER_ABI, signer);

        if (!isFHEInitialized()) {
          await initializeFHEVM();
        }

        if (!cancelled) {
          setContract(instance);
          setContractAddress(targetAddress as `0x${string}`);
        }
      } catch (error) {
        console.error('[UltraSimplifiedSupplyLedger] failed to initialize contract', error);
        if (!cancelled) {
          setContract(null);
          setContractAddress(ZeroAddress);
        }
      } finally {
        if (!cancelled) {
          setInitializing(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [walletClient, chain, address]);

  const requireReady = () => {
    if (!contract || !address || !chain) {
      throw new Error('Wallet connection is required');
    }
    const targetAddress = contractAddress;
    if (targetAddress === ZeroAddress) {
      throw new Error('Ultra-simplified supply ledger contract address is not configured');
    }
    return { contract, targetAddress, signerAddress: address };
  };

  const submitShipment = useCallback(
    async (values: UltraSimplifiedShipmentFormValues, onProgress?: (message: string) => void) => {
      console.log('[UltraSimplifiedSubmitShipment] Starting submission process');
      const { contract, targetAddress, signerAddress } = requireReady();
      console.log('[UltraSimplifiedSubmitShipment] Contract ready:', { targetAddress, signerAddress });

      const shipmentId = normalizeShipmentId(values.shipmentId);
      const carrier = getAddress(values.carrier);
      const receiver = getAddress(values.receiver);
      console.log('[UltraSimplifiedSubmitShipment] Normalized parameters:', { shipmentId, carrier, receiver });

      onProgress?.('🔐 Encrypting VALUE only (1 parameter)...');
      console.log('[UltraSimplifiedSubmitShipment] Starting encryption of ONLY value...');
      const startTime = performance.now();

      // Only encrypt the value (1 parameter)
      const encryptedValue = await encryptUint64(values.declaredValue, targetAddress, signerAddress);

      const encryptionTime = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`[UltraSimplifiedSubmitShipment] ⚡ Encryption completed in ${encryptionTime}s (only 1 param!)`);

      onProgress?.(`✅ Encryption done (${encryptionTime}s). Submitting to blockchain...`);

      try {
        console.log('[UltraSimplifiedSubmitShipment] Calling contract.submitShipment...');
        const tx = await contract.submitShipment(
          shipmentId,
          carrier,
          receiver,
          // Only 1 encrypted parameter with proof
          toContractInput(encryptedValue.data),
          toProofBytes(encryptedValue.proof),
          // All other parameters in plaintext
          values.weightKg,
          values.quantity,
          values.riskCode,
          values.temperature,
          values.humidity,
          values.priority,
          values.category,
          {
            gasLimit: 3000000, // Much lower gas limit for only 1 encryption
          }
        );

        console.log('[UltraSimplifiedSubmitShipment] Transaction sent, hash:', tx.hash);
        onProgress?.('⏳ Waiting for confirmation on-chain...');
        console.log('[UltraSimplifiedSubmitShipment] Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('[UltraSimplifiedSubmitShipment] Transaction confirmed, receipt:', receipt);
        console.log('[UltraSimplifiedSubmitShipment] Gas used:', receipt.gasUsed.toString());
        return { shipmentId, receipt };
      } catch (error: any) {
        console.error('[UltraSimplifiedSubmitShipment] Contract call error:', error);
        console.error('[UltraSimplifiedSubmitShipment] Error details:', {
          message: error?.message,
          code: error?.code,
          data: error?.data,
        });
        if (error.code === 'CALL_EXCEPTION') {
          throw new Error('Contract call failed. Please check if the contract is deployed and you have permission to submit shipments.');
        }
        throw error;
      }
    },
    [contract, address, chain, contractAddress]
  );

  const fetchShipment = useCallback(
    async (shipmentIdRaw: string): Promise<UltraSimplifiedShipmentInfo | null> => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);

      const info = await contract.getShipmentInfo(shipmentId);

      const statusIndex = Number(info[4]);

      return {
        shipmentId,
        shipper: info[0] as string,
        carrier: info[1] as string,
        receiver: info[2] as string,
        category: info[3] as string,
        statusIndex,
        statusLabel: SHIPMENT_STATUS[statusIndex] ?? 'Unknown',
        submittedAt: Number(info[5]),
        deliveredAt: Number(info[6]),
        isActive: Boolean(info[7]),
        weightKg: Number(info[8]),
        quantity: Number(info[9]),
        riskCode: Number(info[10]),
        temperature: Number(info[11]),
        humidity: Number(info[12]),
        priority: Number(info[13]),
      };
    },
    [contract, publicClient, address, chain]
  );

  const fetchSupplyStats = useCallback(async () => {
    const { contract } = requireReady();
    const stats = await contract.getSupplyStats();
    return {
      totalShipments: Number(stats[0]),
      delivered: Number(stats[1]),
      active: Number(stats[2]),
    };
  }, [contract, address, chain]);

  return {
    contract,
    contractAddress,
    isInitializing: initializing,
    isReady: !!contract && !initializing,
    isWrongNetwork,
    // Core functions
    submitShipment,
    // View functions
    fetchShipment,
    fetchSupplyStats,
  };
};