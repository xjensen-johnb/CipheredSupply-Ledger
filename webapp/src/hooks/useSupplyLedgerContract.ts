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

import {
  CARGO_CATEGORIES,
  CIPHERED_SUPPLY_LEDGER_ABI,
  SHIPMENT_STATUS,
} from '@/contracts/cipheredSupplyLedger';
import { getSupplyLedgerAddress, isSupportedChain } from '@/config/contracts';
import {
  encryptUint16,
  encryptBatch,
  encryptUint32,
  encryptUint64,
  encryptUint8,
  initializeFHEVM,
  isFHEInitialized,
  toContractInput,
  toProofBytes,
} from '@/lib/fhevm';

export interface ShipmentFormValues {
  shipmentId: string;
  carrier: string;
  receiver: string;
  weightKg: number;
  volumeCubicMeters: number;
  declaredValue: number;
  quantity: number;
  requiredTemperature: number;
  requiredHumidity: number;
  fragilityScore: number;
  priorityScore: number;
  riskCode: number;
  category: (typeof CARGO_CATEGORIES)[number];
}

export interface InspectionFormValues {
  shipmentId: string;
  actualTemperature: number;
  actualHumidity: number;
  conditionScore: number;
  packagingScore: number;
  documentationScore: number;
}

export interface CheckpointFormValues {
  shipmentId: string;
  locationCode: number;
  temperatureReading: number;
  humidityReading: number;
  scanTimestamp: number;
  handlerId: number;
}

export interface ClaimFormValues {
  shipmentId: string;
  claimAmount: number;
  damagePercent: number;
}

export interface ShipmentOverview {
  shipmentId: `0x${string}`;
  shipper: string;
  carrier: string;
  receiver: string;
  categoryIndex: number;
  categoryLabel: string;
  statusIndex: number;
  statusLabel: string;
  submittedAt: number;
  clearedAt: number;
  deliveredAt: number;
  isActive: boolean;
  isInsured: boolean;
  statusChangeCount: number;
  checkpointCount: number;
  inspection: {
    inspector: string;
    passed: boolean;
    complete: boolean;
    inspectedAt: number;
  } | null;
  clearance: {
    clearanceStatus: number;
    finalWeight: number;
    complianceScore: number;
    insuranceEligibility: number;
    isDecrypted: boolean;
  } | null;
  claim: {
    claimant: string;
    filedAt: number;
    approved: boolean;
    processed: boolean;
  } | null;
  checkpoints: Array<{
    index: number;
    recordedAt: number;
    recordedBy: string;
    isVerified: boolean;
  }>;
}

export interface SupplyStats {
  totalShipments: number;
  delivered: number;
  lost: number;
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

const resolveCategoryIndex = (category: ShipmentFormValues['category']): number => {
  const index = CARGO_CATEGORIES.indexOf(category);
  if (index === -1) {
    throw new Error('Invalid cargo category');
  }
  return index;
};

export const useSupplyLedgerContract = () => {
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

      const targetAddress = getSupplyLedgerAddress(chain.id);
      if (targetAddress === ZeroAddress) {
        console.warn('[SupplyLedger] contract address not configured for chain', chain.id);
        setContract(null);
        setContractAddress(targetAddress);
        return;
      }

      setInitializing(true);
      try {
        const provider = new BrowserProvider(walletClient as any);
        const signer = await provider.getSigner();
        const instance = new Contract(targetAddress, CIPHERED_SUPPLY_LEDGER_ABI, signer);

        if (!isFHEInitialized()) {
          await initializeFHEVM();
        }

        if (!cancelled) {
          setContract(instance);
          setContractAddress(targetAddress);
        }
      } catch (error) {
        console.error('[SupplyLedger] failed to initialize contract', error);
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
    const targetAddress = getSupplyLedgerAddress(chain.id);
    if (targetAddress === ZeroAddress) {
      throw new Error('Supply ledger contract address is not configured');
    }
    return { contract, targetAddress, signerAddress: address };
  };

  const submitShipment = useCallback(
    async (values: ShipmentFormValues, onProgress?: (message: string) => void) => {
      console.log('[submitShipment] Starting submission process');
      const { contract, targetAddress, signerAddress } = requireReady();
      console.log('[submitShipment] Contract ready:', { targetAddress, signerAddress });

      const shipmentId = normalizeShipmentId(values.shipmentId);
      const carrier = getAddress(values.carrier);
      const receiver = getAddress(values.receiver);
      const category = resolveCategoryIndex(values.category);
      console.log('[submitShipment] Normalized parameters:', { shipmentId, carrier, receiver, category });

      onProgress?.('🔐 Encrypting 9 parameters individually...');
      console.log('[submitShipment] Starting independent encryption (each param gets own proof)...');
      const startTime = performance.now();

      // Contract requires EACH parameter to have its OWN proof
      // Cannot share proofs between parameters
      const [
        encryptedWeight,
        encryptedVolume,
        encryptedValue,
        encryptedQuantity,
        encryptedTemperature,
        encryptedHumidity,
        encryptedFragility,
        encryptedPriority,
        encryptedRisk
      ] = await Promise.all([
        encryptUint64(values.weightKg, targetAddress, signerAddress),
        encryptUint64(values.volumeCubicMeters, targetAddress, signerAddress),
        encryptUint64(values.declaredValue, targetAddress, signerAddress),
        encryptUint32(values.quantity, targetAddress, signerAddress),
        encryptUint16(values.requiredTemperature, targetAddress, signerAddress),
        encryptUint16(values.requiredHumidity, targetAddress, signerAddress),
        encryptUint8(values.fragilityScore, targetAddress, signerAddress),
        encryptUint32(values.priorityScore, targetAddress, signerAddress),
        encryptUint8(values.riskCode, targetAddress, signerAddress),
      ]);

      const encryptionTime = ((performance.now() - startTime) / 1000).toFixed(2);
      console.log(`[submitShipment] Encryption completed in ${encryptionTime}s`);

      // Log sample data to verify format
      console.log('[submitShipment] Sample encrypted data:', {
        weightData: encryptedWeight.data.substring(0, 20) + '...',
        weightProof: encryptedWeight.proof.substring(0, 20) + '...',
      });

      onProgress?.(`✅ Encryption done (${encryptionTime}s). Submitting to blockchain...`);

      try {
        console.log('[submitShipment] Calling contract.submitShipment...');
        const tx = await contract.submitShipment(
          shipmentId,
          carrier,
          receiver,
          toContractInput(encryptedWeight.data),
          toProofBytes(encryptedWeight.proof),
          toContractInput(encryptedVolume.data),
          toProofBytes(encryptedVolume.proof),
          toContractInput(encryptedValue.data),
          toProofBytes(encryptedValue.proof),
          toContractInput(encryptedQuantity.data),
          toProofBytes(encryptedQuantity.proof),
          toContractInput(encryptedTemperature.data),
          toProofBytes(encryptedTemperature.proof),
          toContractInput(encryptedHumidity.data),
          toProofBytes(encryptedHumidity.proof),
          toContractInput(encryptedFragility.data),
          toProofBytes(encryptedFragility.proof),
          toContractInput(encryptedPriority.data),
          toProofBytes(encryptedPriority.proof),
          toContractInput(encryptedRisk.data),
          toProofBytes(encryptedRisk.proof),
          category,
          {
            gasLimit: 10000000, // 10M gas limit for FHE operations
          }
        );

        console.log('[submitShipment] Transaction sent, hash:', tx.hash);
        onProgress?.('Waiting for shipment confirmation on-chain...');
        console.log('[submitShipment] Waiting for transaction confirmation...');
        const receipt = await tx.wait();
        console.log('[submitShipment] Transaction confirmed, receipt:', receipt);
        return { shipmentId, receipt };
      } catch (error: any) {
        console.error('[submitShipment] Contract call error:', error);
        console.error('[submitShipment] Error details:', {
          message: error?.message,
          code: error?.code,
          data: error?.data,
        });
        if (error.code === 'CALL_EXCEPTION') {
          throw new Error('Contract call failed. Please check if you have permission to submit shipments.');
        }
        throw error;
      }
    },
    [contract, address, chain]
  );

  const conductInspection = useCallback(
    async (values: InspectionFormValues, onProgress?: (message: string) => void) => {
      const { contract, targetAddress, signerAddress } = requireReady();

      const shipmentId = normalizeShipmentId(values.shipmentId);

      onProgress?.('Encrypting inspection parameters...');

      // Parallel encryption for faster processing
      const [encTemp, encHumidity, encCondition, encPackaging, encDocumentation] = await Promise.all([
        encryptUint16(values.actualTemperature, targetAddress, signerAddress),
        encryptUint16(values.actualHumidity, targetAddress, signerAddress),
        encryptUint8(values.conditionScore, targetAddress, signerAddress),
        encryptUint8(values.packagingScore, targetAddress, signerAddress),
        encryptUint8(values.documentationScore, targetAddress, signerAddress),
      ]);

      onProgress?.('Submitting quality inspection results...');
      const tx = await contract.conductQualityInspection(
        shipmentId,
        toContractInput(encTemp.data),
        toProofBytes(encTemp.proof),
        toContractInput(encHumidity.data),
        toProofBytes(encHumidity.proof),
        toContractInput(encCondition.data),
        toProofBytes(encCondition.proof),
        toContractInput(encPackaging.data),
        toProofBytes(encPackaging.proof),
        toContractInput(encDocumentation.data),
        toProofBytes(encDocumentation.proof)
      );

      onProgress?.('Waiting for inspection finalization...');
      const receipt = await tx.wait();
      return { shipmentId, receipt };
    },
    [contract, address, chain]
  );

  const requestCustomsClearance = useCallback(
    async (shipmentIdRaw: string, onProgress?: (message: string) => void) => {
      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);

      onProgress?.('Preparing customs clearance request...');
      const expectedRequestId = await contract.callStatic.requestCustomsClearance(shipmentId);

      onProgress?.('Submitting customs clearance request...');
      const tx = await contract.requestCustomsClearance(shipmentId);

      onProgress?.('Waiting for clearance processing...');
      const receipt = await tx.wait();
      return { shipmentId, requestId: Number(expectedRequestId), receipt };
    },
    [contract, address, chain]
  );

  const recordCheckpoint = useCallback(
    async (values: CheckpointFormValues, onProgress?: (message: string) => void) => {
      const { contract, targetAddress, signerAddress } = requireReady();
      const shipmentId = normalizeShipmentId(values.shipmentId);

      onProgress?.('Encrypting checkpoint data...');

      // Parallel encryption
      const [encLocation, encTemp, encHumidity, encScan, encHandler] = await Promise.all([
        encryptUint32(values.locationCode, targetAddress, signerAddress),
        encryptUint16(values.temperatureReading, targetAddress, signerAddress),
        encryptUint16(values.humidityReading, targetAddress, signerAddress),
        encryptUint64(values.scanTimestamp, targetAddress, signerAddress),
        encryptUint8(values.handlerId, targetAddress, signerAddress),
      ]);

      onProgress?.('Recording encrypted checkpoint...');
      const tx = await contract.recordCheckpoint(
        shipmentId,
        toContractInput(encLocation.data),
        toProofBytes(encLocation.proof),
        toContractInput(encTemp.data),
        toProofBytes(encTemp.proof),
        toContractInput(encHumidity.data),
        toProofBytes(encHumidity.proof),
        toContractInput(encScan.data),
        toProofBytes(encScan.proof),
        toContractInput(encHandler.data),
        toProofBytes(encHandler.proof)
      );

      onProgress?.('Waiting for checkpoint confirmation...');
      const receipt = await tx.wait();
      return { shipmentId, receipt };
    },
    [contract, address, chain]
  );

  const markDelivered = useCallback(
    async (shipmentIdRaw: string, onProgress?: (message: string) => void) => {
      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);

      onProgress?.('Submitting delivery confirmation...');
      const tx = await contract.markDelivered(shipmentId);
      const receipt = await tx.wait();
      return { shipmentId, receipt };
    },
    [contract, address, chain]
  );

  const fileInsuranceClaim = useCallback(
    async (values: ClaimFormValues, onProgress?: (message: string) => void) => {
      const { contract, targetAddress, signerAddress } = requireReady();
      const shipmentId = normalizeShipmentId(values.shipmentId);

      onProgress?.('Encrypting claim data...');

      // Parallel encryption
      const [encAmount, encDamage] = await Promise.all([
        encryptUint64(values.claimAmount, targetAddress, signerAddress),
        encryptUint8(values.damagePercent, targetAddress, signerAddress),
      ]);

      onProgress?.('Submitting insurance claim...');
      const tx = await contract.fileInsuranceClaim(
        shipmentId,
        toContractInput(encAmount.data),
        toProofBytes(encAmount.proof),
        toContractInput(encDamage.data),
        toProofBytes(encDamage.proof)
      );

      const receipt = await tx.wait();
      return { shipmentId, receipt };
    },
    [contract, address, chain]
  );

  const fetchShipment = useCallback(
    async (shipmentIdRaw: string): Promise<ShipmentOverview | null> => {
      if (!publicClient) {
        throw new Error('Public client not available');
      }

      const { contract } = requireReady();
      const shipmentId = normalizeShipmentId(shipmentIdRaw);

      const [info, inspection, clearance, claim] = await Promise.all([
        contract.getShipmentInfo(shipmentId),
        contract.getInspectionInfo(shipmentId),
        contract.getClearanceInfo(shipmentId),
        contract.getClaimInfo(shipmentId),
      ]);

      const checkpointCountBig = await contract.getCheckpointCount(shipmentId);
      const checkpointCount = Number(checkpointCountBig);

      const checkpoints: ShipmentOverview['checkpoints'] = [];
      for (let i = 0; i < checkpointCount; i++) {
        const entry = await contract.getCheckpoint(shipmentId, i);
        checkpoints.push({
          index: i,
          recordedAt: Number(entry[0]),
          recordedBy: entry[1] as string,
          isVerified: Boolean(entry[2]),
        });
      }

      const categoryIndex = Number(info[3]);
      const statusIndex = Number(info[4]);

      return {
        shipmentId,
        shipper: info[0] as string,
        carrier: info[1] as string,
        receiver: info[2] as string,
        categoryIndex,
        categoryLabel: CARGO_CATEGORIES[categoryIndex] ?? 'Unknown',
        statusIndex,
        statusLabel: SHIPMENT_STATUS[statusIndex] ?? 'Unknown',
        submittedAt: Number(info[5]),
        clearedAt: Number(info[6]),
        deliveredAt: Number(info[7]),
        isActive: Boolean(info[8]),
        isInsured: Boolean(info[9]),
        statusChangeCount: Number(info[10]),
        checkpointCount: Number(info[11]),
        inspection: inspection[3] > 0n
          ? {
              inspector: inspection[0] as string,
              passed: Boolean(inspection[1]),
              complete: Boolean(inspection[2]),
              inspectedAt: Number(inspection[3]),
            }
          : null,
        clearance: clearance[4]
          ? {
              clearanceStatus: Number(clearance[0]),
              finalWeight: Number(clearance[1]),
              complianceScore: Number(clearance[2]),
              insuranceEligibility: Number(clearance[3]),
              isDecrypted: Boolean(clearance[4]),
            }
          : null,
        claim: claim[1] > 0n
          ? {
              claimant: claim[0] as string,
              filedAt: Number(claim[1]),
              approved: Boolean(claim[2]),
              processed: Boolean(claim[3]),
            }
          : null,
        checkpoints,
      };
    },
    [contract, publicClient, address, chain]
  );

  const fetchSupplyStats = useCallback(async (): Promise<SupplyStats> => {
    const { contract } = requireReady();
    const stats = await contract.getSupplyChainStats();
    return {
      totalShipments: Number(stats[0]),
      delivered: Number(stats[1]),
      lost: Number(stats[2]),
    };
  }, [contract, address, chain]);

  return {
    contract,
    contractAddress,
    isInitializing: initializing,
    isReady: !!contract && !initializing,
    isWrongNetwork,
    submitShipment,
    conductInspection,
    requestCustomsClearance,
    recordCheckpoint,
    markDelivered,
    fileInsuranceClaim,
    fetchShipment,
    fetchSupplyStats,
  };
};
