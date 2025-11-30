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
  encryptUint32,
  encryptUint64,
  encryptUint8,
  initializeFHEVM,
  isFHEInitialized,
  toContractInput,
  toProofBytes,
} from '@/lib/fhevm';

// Simplified ABI for the new contract
export const SIMPLIFIED_SUPPLY_LEDGER_ABI = [
  // Constructor
  'constructor()',

  // Admin functions
  'function owner() view returns (address)',
  'function authorizeCarrier(address carrier)',
  'function revokeCarrier(address carrier)',
  'function addInspector(address inspector)',
  'function removeInspector(address inspector)',

  // Core functions (simplified with only 1 encrypted param - value)
  'function submitShipment(bytes32 shipmentId, address carrier, address receiver, bytes32 encryptedValue, bytes valueProof, uint256 weightKg, uint256 quantity, uint256 riskCode, uint256 temperature, uint256 humidity, uint256 priority, string category) returns (bytes32)',
  'function startTransit(bytes32 shipmentId)',
  'function markDelivered(bytes32 shipmentId)',
  'function markLost(bytes32 shipmentId)',
  'function assessRisk(bytes32 shipmentId) view returns (bool)',

  // View functions
  'function getShipmentInfo(bytes32 shipmentId) view returns (address shipper, address carrier, address receiver, string category, uint8 status, uint256 submittedAt, uint256 deliveredAt, bool isActive, uint256 weightKg, uint256 quantity, uint256 riskCode, uint256 temperature, uint256 humidity, uint256 priority)',
  'function getSupplyStats() view returns (uint256 totalShipments, uint256 delivered, uint256 active)',
  'function isCarrier(address account) view returns (bool)',
  'function isInspector(address account) view returns (bool)',
  'function shipmentCount() view returns (uint256)',
  'function deliveredCount() view returns (uint256)',

  // User shipment queries
  'function getShipmentsByShipper(address shipper) view returns (bytes32[])',
  'function getShipperShipmentCount(address shipper) view returns (uint256)',
  'function getShipmentsByCarrier(address carrier) view returns (bytes32[])',
  'function getShipmentsByReceiver(address receiver) view returns (bytes32[])',
  'function getAllUserShipments(address user) view returns (bytes32[] asShipper, bytes32[] asCarrier, bytes32[] asReceiver)',

  // Events
  'event ShipmentSubmitted(bytes32 indexed shipmentId, address indexed shipper, address indexed carrier, string category, uint256 timestamp)',
  'event ShipmentStatusChanged(bytes32 indexed shipmentId, uint8 oldStatus, uint8 newStatus, uint256 timestamp)',
  'event ShipmentDelivered(bytes32 indexed shipmentId, uint256 timestamp)',
];

export const CARGO_CATEGORIES = [
  'GeneralGoods',
  'Perishable',
  'Hazardous',
  'HighValue',
  'Pharmaceutical',
  'Electronics',
] as const;

export const SHIPMENT_STATUS = [
  'Draft',
  'Submitted',
  'InTransit',
  'Delivered',
  'Lost',
] as const;

export interface SimplifiedShipmentFormValues {
  shipmentId: string;
  carrier: string;
  receiver: string;
  // Only 4 encrypted parameters
  weightKg: number;
  declaredValue: number;
  quantity: number;
  riskCode: number;
  // Plaintext parameters
  temperature: number;
  humidity: number;
  priority: number;
  category: (typeof CARGO_CATEGORIES)[number];
}

export interface SimplifiedShipmentInfo {
  shipmentId: `0x${string}`;
  shipper: string;
  carrier: string;
  receiver: string;
  categoryIndex: number;
  categoryLabel: string;
  statusIndex: number;
  statusLabel: string;
  submittedAt: number;
  deliveredAt: number;
  isActive: boolean;
  temperature: number;
  humidity: number;
  priority: number;
}

export interface SimplifiedSupplyStats {
  totalShipments: number;
  delivered: number;
  active: number;
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

const resolveCategoryIndex = (category: SimplifiedShipmentFormValues['category']): number => {
  const index = CARGO_CATEGORIES.indexOf(category);
  if (index === -1) {
    throw new Error('Invalid cargo category');
  }
  return index;
};

export const useSimplifiedSupplyLedger = () => {
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

      // Get the simplified contract address from env or config
      const targetAddress = import.meta.env.VITE_SIMPLIFIED_SUPPLY_LEDGER_ADDRESS ||
                           getSupplyLedgerAddress(chain.id);

      console.log('[SimplifiedSupplyLedger] Target address from env:', import.meta.env.VITE_SIMPLIFIED_SUPPLY_LEDGER_ADDRESS);
      console.log('[SimplifiedSupplyLedger] Final target address:', targetAddress);
      console.log('[SimplifiedSupplyLedger] Chain ID:', chain.id);

      if (!targetAddress || targetAddress === ZeroAddress) {
        console.error('[SimplifiedSupplyLedger] ❌ contract address not configured for chain', chain.id);
        setContract(null);
        setContractAddress(targetAddress as `0x${string}`);
        setInitializing(false);
        return;
      }

      setInitializing(true);
      try {
        console.log('[SimplifiedSupplyLedger] Creating provider...');
        const provider = new BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        console.log('[SimplifiedSupplyLedger] Signer obtained:', await signer.getAddress());

        const instance = new Contract(targetAddress, SIMPLIFIED_SUPPLY_LEDGER_ABI, signer);
        console.log('[SimplifiedSupplyLedger] Contract instance created');

        console.log('[SimplifiedSupplyLedger] Checking FHE initialization...');
        if (!isFHEInitialized()) {
          console.log('[SimplifiedSupplyLedger] Initializing FHE...');
          await initializeFHEVM();
          console.log('[SimplifiedSupplyLedger] ✅ FHE initialized successfully');
        } else {
          console.log('[SimplifiedSupplyLedger] ✅ FHE already initialized');
        }

        if (!cancelled) {
          console.log('[SimplifiedSupplyLedger] ✅ Setting contract as ready');
          setContract(instance);
          setContractAddress(targetAddress as `0x${string}`);
        }
      } catch (error) {
        console.error('[SimplifiedSupplyLedger] ❌ Failed to initialize contract', error);
        if (!cancelled) {
          setContract(null);
          setContractAddress(ZeroAddress);
        }
      } finally {
        if (!cancelled) {
          console.log('[SimplifiedSupplyLedger] Initialization complete, setting initializing to false');
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
      throw new Error('Simplified supply ledger contract address is not configured');
    }
    return { contract, targetAddress, signerAddress: address };
  };

  const submitShipment = useCallback(
    async (values: SimplifiedShipmentFormValues, onProgress?: (message: string) => void) => {
      console.log('[SimplifiedSubmitShipment] Starting submission process');
      const { contract, targetAddress, signerAddress } = requireReady();
      console.log('[SimplifiedSubmitShipment] Contract ready:', { targetAddress, signerAddress });

      const shipmentId = normalizeShipmentId(values.shipmentId);
      const carrier = getAddress(values.carrier);
      const receiver = getAddress(values.receiver);
      const category = resolveCategoryIndex(values.category);
      console.log('[SimplifiedSubmitShipment] Normalized parameters:', { shipmentId, carrier, receiver, category });

      onProgress?.('🔐 Encrypting shipment value...');
      console.log('[SimplifiedSubmitShipment] Starting encryption of value only...');
      const startTime = performance.now();

      // Only encrypt 1 parameter (value) to match contract
      const encryptedValue = await encryptUint64(values.declaredValue, targetAddress, signerAddress);

      const encryptionTime = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`[SimplifiedSubmitShipment] Encryption completed in ${encryptionTime}s (1 param only)`);

      // Log sample data to verify format
      console.log('[SimplifiedSubmitShipment] Sample encrypted data:', {
        valueData: encryptedValue.data.substring(0, 20) + '...',
        valueProof: encryptedValue.proof.substring(0, 20) + '...',
      });

      onProgress?.(`✅ Encryption done (${encryptionTime}s). Submitting to blockchain...`);

      let txHash: string | undefined;
      try {
        console.log('[SimplifiedSubmitShipment] Calling contract.submitShipment...');
        const tx = await contract.submitShipment(
          shipmentId,
          carrier,
          receiver,
          // Only 1 encrypted parameter (value) with proof
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
            gasLimit: 3000000, // Reduced gas limit for fewer operations
          }
        );

        txHash = tx.hash;
        console.log('[SimplifiedSubmitShipment] Transaction sent, hash:', tx.hash);
        onProgress?.(`⏳ Waiting for confirmation on-chain... (${tx.hash.substring(0, 10)}...)`);
        console.log('[SimplifiedSubmitShipment] Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('[SimplifiedSubmitShipment] Transaction confirmed, receipt:', receipt);
        console.log('[SimplifiedSubmitShipment] Gas used:', receipt.gasUsed.toString());
        return { shipmentId, receipt, txHash: tx.hash };
      } catch (error: any) {
        console.error('[SimplifiedSubmitShipment] Contract call error:', error);
        console.error('[SimplifiedSubmitShipment] Error details:', {
          message: error?.message,
          code: error?.code,
          data: error?.data,
          txHash,
        });
        // Attach txHash to error for UI display
        error.txHash = txHash;
        if (error.code === 'CALL_EXCEPTION') {
          const enhancedError = new Error('Contract call failed. Please check if the contract is deployed and you have permission to submit shipments.');
          (enhancedError as any).txHash = txHash;
          throw enhancedError;
        }
        throw error;
      }
    },
    [contract, address, chain, contractAddress]
  );

  const startTransit = useCallback(
    async (shipmentIdRaw: string, onProgress?: (message: string) => void) => {
      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);

      onProgress?.('Starting shipment transit...');
      const tx = await contract.startTransit(shipmentId);
      const txHash = tx.hash;

      onProgress?.(`Waiting for confirmation... (${txHash.substring(0, 10)}...)`);
      const receipt = await tx.wait();
      return { shipmentId, receipt, txHash };
    },
    [contract, address, chain]
  );

  const markDelivered = useCallback(
    async (shipmentIdRaw: string, onProgress?: (message: string) => void) => {
      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);

      onProgress?.('Marking shipment as delivered...');
      const tx = await contract.markDelivered(shipmentId);
      const txHash = tx.hash;

      onProgress?.(`Waiting for confirmation... (${txHash.substring(0, 10)}...)`);
      const receipt = await tx.wait();
      return { shipmentId, receipt, txHash };
    },
    [contract, address, chain]
  );

  const markLost = useCallback(
    async (shipmentIdRaw: string, onProgress?: (message: string) => void) => {
      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);

      onProgress?.('Marking shipment as lost...');
      const tx = await contract.markLost(shipmentId);
      const txHash = tx.hash;

      onProgress?.(`Waiting for confirmation... (${txHash.substring(0, 10)}...)`);
      const receipt = await tx.wait();
      return { shipmentId, receipt, txHash };
    },
    [contract, address, chain]
  );

  const fetchShipment = useCallback(
    async (shipmentIdRaw: string): Promise<SimplifiedShipmentInfo | null> => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);

      const info = await contract.getShipmentInfo(shipmentId);

      const categoryLabel = info[3] as string;
      const statusIndex = Number(info[4]);

      return {
        shipmentId,
        shipper: info[0] as string,
        carrier: info[1] as string,
        receiver: info[2] as string,
        categoryIndex: CARGO_CATEGORIES.indexOf(categoryLabel as any) ?? -1,
        categoryLabel,
        statusIndex,
        statusLabel: SHIPMENT_STATUS[statusIndex] ?? 'Unknown',
        submittedAt: Number(info[5]),
        deliveredAt: Number(info[6]),
        isActive: Boolean(info[7]),
        temperature: Number(info[10]),
        humidity: Number(info[11]),
        priority: Number(info[12]),
      };
    },
    [contract, publicClient, address, chain]
  );

  const fetchSupplyStats = useCallback(async (): Promise<SimplifiedSupplyStats> => {
    const { contract } = requireReady();
    const stats = await contract.getSupplyStats();
    return {
      totalShipments: Number(stats[0]),
      delivered: Number(stats[1]),
      active: Number(stats[2]),
    };
  }, [contract, address, chain]);

  const authorizeCarrier = useCallback(
    async (carrierAddress: string) => {
      const { contract } = requireReady();
      const carrier = getAddress(carrierAddress);
      const tx = await contract.authorizeCarrier(carrier);
      await tx.wait();
      return { carrier };
    },
    [contract, address, chain]
  );

  const addInspector = useCallback(
    async (inspectorAddress: string) => {
      const { contract } = requireReady();
      const inspector = getAddress(inspectorAddress);
      const tx = await contract.addInspector(inspector);
      await tx.wait();
      return { inspector };
    },
    [contract, address, chain]
  );

  const assessRisk = useCallback(
    async (shipmentIdRaw: string): Promise<boolean> => {
      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);
      const isLowRisk = await contract.assessRisk(shipmentId);
      return isLowRisk;
    },
    [contract, address, chain]
  );

  const fetchUserShipments = useCallback(
    async (userAddress?: string): Promise<{
      asShipper: SimplifiedShipmentInfo[];
      asCarrier: SimplifiedShipmentInfo[];
      asReceiver: SimplifiedShipmentInfo[];
    }> => {
      const { contract } = requireReady();
      const targetUser = userAddress || address;
      if (!targetUser) throw new Error('No user address');

      const [shipperIds, carrierIds, receiverIds] = await contract.getAllUserShipments(targetUser);

      const fetchShipmentDetails = async (ids: string[]): Promise<SimplifiedShipmentInfo[]> => {
        const shipments: SimplifiedShipmentInfo[] = [];
        for (const id of ids) {
          try {
            const info = await contract.getShipmentInfo(id);
            const categoryLabel = info[3] as string;
            const statusIndex = Number(info[4]);
            shipments.push({
              shipmentId: id as `0x${string}`,
              shipper: info[0] as string,
              carrier: info[1] as string,
              receiver: info[2] as string,
              categoryIndex: CARGO_CATEGORIES.indexOf(categoryLabel as any) ?? -1,
              categoryLabel,
              statusIndex,
              statusLabel: SHIPMENT_STATUS[statusIndex] ?? 'Unknown',
              submittedAt: Number(info[5]),
              deliveredAt: Number(info[6]),
              isActive: Boolean(info[7]),
              temperature: Number(info[10]),
              humidity: Number(info[11]),
              priority: Number(info[12]),
            });
          } catch (e) {
            console.error(`Failed to fetch shipment ${id}:`, e);
          }
        }
        return shipments;
      };

      const [asShipper, asCarrier, asReceiver] = await Promise.all([
        fetchShipmentDetails(shipperIds),
        fetchShipmentDetails(carrierIds),
        fetchShipmentDetails(receiverIds),
      ]);

      return { asShipper, asCarrier, asReceiver };
    },
    [contract, address, chain]
  );

  const fetchShipperShipmentCount = useCallback(
    async (shipperAddress?: string): Promise<number> => {
      const { contract } = requireReady();
      const targetShipper = shipperAddress || address;
      if (!targetShipper) throw new Error('No shipper address');
      const count = await contract.getShipperShipmentCount(targetShipper);
      return Number(count);
    },
    [contract, address, chain]
  );

  return {
    contract,
    contractAddress,
    isInitializing: initializing,
    isReady: !!contract && !initializing,
    isWrongNetwork,
    // Core functions
    submitShipment,
    startTransit,
    markDelivered,
    markLost,
    // View functions
    fetchShipment,
    fetchSupplyStats,
    assessRisk,
    // User shipment queries
    fetchUserShipments,
    fetchShipperShipmentCount,
    // Admin functions
    authorizeCarrier,
    addInspector,
  };
};