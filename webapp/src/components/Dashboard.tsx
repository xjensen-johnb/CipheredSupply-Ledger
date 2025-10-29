import { useEffect, useMemo, useState } from 'react';
import { ZeroAddress } from 'ethers';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useForm } from 'react-hook-form';
import { format } from 'date-fns';
import {
  Package,
  Shield,
  Truck,
  ClipboardList,
  Search,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Clock,
  MapPin,
  Activity,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Separator } from '@/components/ui/separator';

import {
  CheckpointFormValues,
  ClaimFormValues,
  InspectionFormValues,
  ShipmentFormValues,
  ShipmentOverview,
  SupplyStats,
  useSupplyLedgerContract,
} from '@/hooks/useSupplyLedgerContract';
import { CARGO_CATEGORIES } from '@/contracts/cipheredSupplyLedger';

type ShipmentFormInputs = ShipmentFormValues;
type InspectionFormInputs = InspectionFormValues;
type CheckpointFormInputs = CheckpointFormValues;
type ClaimFormInputs = ClaimFormValues;

const numberFieldOptions = { valueAsNumber: true } as const;

const StatCard = ({
  title,
  value,
  icon: Icon,
  change,
}: {
  title: string;
  value: string;
  icon: any;
  change?: string;
}) => {
  return (
    <div className="rounded-lg border border-blue-900/20 bg-slate-950 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <h3 className="text-3xl font-semibold text-slate-50">{value}</h3>
            {change && <span className="text-xs text-blue-400">{change}</span>}
          </div>
        </div>
        <div className="rounded-lg bg-blue-500/10 p-2.5">
          <Icon className="h-5 w-5 text-blue-400" />
        </div>
      </div>
    </div>
  );
};

const ShipmentOverviewCard = ({ data }: { data: ShipmentOverview }) => {
  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      Lost: 'bg-red-500/10 text-red-400 border-red-500/20',
      InTransit: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      Cleared: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      default: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return styles[status] || styles.default;
  };

  return (
    <div className="space-y-6 rounded-lg border border-blue-900/20 bg-slate-950 p-6">
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <Package className="h-5 w-5 text-blue-400" />
            <h3 className="font-mono text-sm font-medium text-slate-300">{data.shipmentId}</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={getStatusBadge(data.statusLabel)}>
              {data.statusLabel}
            </Badge>
            <Badge variant="outline" className="border-slate-700 bg-slate-900 text-slate-300">
              {data.categoryLabel}
            </Badge>
            {data.isInsured && (
              <Badge variant="outline" className="border-blue-500/20 bg-blue-500/10 text-blue-400">
                <Shield className="mr-1 h-3 w-3" />
                Insured
              </Badge>
            )}
          </div>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Shipper</p>
          <p className="font-mono text-xs text-slate-300">
            {data.shipper.slice(0, 6)}...{data.shipper.slice(-4)}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Carrier</p>
          <p className="font-mono text-xs text-slate-300">
            {data.carrier.slice(0, 6)}...{data.carrier.slice(-4)}
          </p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Receiver</p>
          <p className="font-mono text-xs text-slate-300">
            {data.receiver.slice(0, 6)}...{data.receiver.slice(-4)}
          </p>
        </div>
      </div>

      <Separator className="bg-slate-800" />

      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-slate-300">Timeline</h4>
        <div className="space-y-3">
          {data.submittedAt > 0 && (
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
                <div className="h-2 w-2 rounded-full bg-slate-500" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300">Submitted</p>
                <p className="text-xs text-slate-500">{format(data.submittedAt * 1000, 'MMM d, yyyy HH:mm')}</p>
              </div>
            </div>
          )}
          {data.clearedAt > 0 && (
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-cyan-500/50 bg-cyan-500/10">
                <div className="h-2 w-2 rounded-full bg-cyan-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300">Cleared</p>
                <p className="text-xs text-slate-500">{format(data.clearedAt * 1000, 'MMM d, yyyy HH:mm')}</p>
              </div>
            </div>
          )}
          {data.deliveredAt > 0 && (
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/50 bg-emerald-500/10">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-slate-300">Delivered</p>
                <p className="text-xs text-slate-500">{format(data.deliveredAt * 1000, 'MMM d, yyyy HH:mm')}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {data.inspection && (
        <>
          <Separator className="bg-slate-800" />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">Quality Inspection</h4>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-500">Inspector</p>
                <p className="font-mono text-xs text-slate-300">{data.inspection.inspector.slice(0, 10)}...</p>
              </div>
              <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-500">Status</p>
                <Badge
                  variant="outline"
                  className={
                    data.inspection.passed
                      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                      : 'border-red-500/20 bg-red-500/10 text-red-400'
                  }
                >
                  {data.inspection.passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>
          </div>
        </>
      )}

      {data.clearance && (
        <>
          <Separator className="bg-slate-800" />
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-slate-300">Customs Clearance</h4>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-500">Status</p>
                <p className="text-sm font-medium text-slate-200">{data.clearance.clearanceStatus}</p>
              </div>
              <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-500">Compliance</p>
                <p className="text-sm font-medium text-slate-200">{data.clearance.complianceScore}</p>
              </div>
              <div className="space-y-1.5 rounded-lg border border-slate-800 bg-slate-900/50 p-3">
                <p className="text-xs text-slate-500">Insurance</p>
                <p className="text-sm font-medium text-slate-200">
                  {data.clearance.insuranceEligibility === 1 ? 'Eligible' : 'Ineligible'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {data.checkpoints.length > 0 && (
        <>
          <Separator className="bg-slate-800" />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-blue-400" />
              <h4 className="text-sm font-semibold text-slate-300">
                Checkpoints ({data.checkpoints.length})
              </h4>
            </div>
            <div className="max-h-48 space-y-2 overflow-y-auto">
              {data.checkpoints.map((checkpoint, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/10 text-xs font-medium text-blue-400">
                      {idx + 1}
                    </div>
                    <div className="text-xs text-slate-400">
                      {format(checkpoint.recordedAt * 1000, 'MMM d, HH:mm')}
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      checkpoint.isVerified
                        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
                        : 'border-slate-700 bg-slate-900 text-slate-400'
                    }
                  >
                    {checkpoint.isVerified ? 'Verified' : 'Pending'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const useProgress = () => {
  const [message, setMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const wrap = async <T,>(action: (update: (next: string) => void) => Promise<T>): Promise<T | null> => {
    setIsLoading(true);
    setMessage('Processing...');
    try {
      const result = await action(setMessage);
      setMessage(null);
      setIsLoading(false);
      return result;
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      setMessage(null);
      throw error;
    }
  };

  return { message, isLoading, wrap };
};

export const Dashboard = () => {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const {
    contractAddress,
    isInitializing,
    isReady,
    isWrongNetwork,
    submitShipment,
    conductInspection,
    requestCustomsClearance,
    recordCheckpoint,
    markDelivered,
    fileInsuranceClaim,
    fetchShipment,
    fetchSupplyStats,
  } = useSupplyLedgerContract();

  const shipmentProgress = useProgress();
  const inspectionProgress = useProgress();
  const checkpointProgress = useProgress();
  const claimProgress = useProgress();
  const deliveryProgress = useProgress();
  const customsProgress = useProgress();

  const shipmentForm = useForm<ShipmentFormInputs>({
    defaultValues: {
      shipmentId: '',
      carrier: '',
      receiver: '',
      weightKg: 10000,
      volumeCubicMeters: 50,
      declaredValue: 50000,
      quantity: 100,
      requiredTemperature: 280,
      requiredHumidity: 50,
      fragilityScore: 5,
      priorityScore: 250,
      riskCode: 1,
      category: CARGO_CATEGORIES[0],
    },
  });

  const inspectionForm = useForm<InspectionFormInputs>({
    defaultValues: {
      shipmentId: '',
      actualTemperature: 285,
      actualHumidity: 48,
      conditionScore: 80,
      packagingScore: 85,
      documentationScore: 90,
    },
  });

  const checkpointForm = useForm<CheckpointFormInputs>({
    defaultValues: {
      shipmentId: '',
      locationCode: 10101,
      temperatureReading: 283,
      humidityReading: 45,
      scanTimestamp: Math.floor(Date.now() / 1000),
      handlerId: 7,
    },
  });

  const claimForm = useForm<ClaimFormInputs>({
    defaultValues: {
      shipmentId: '',
      claimAmount: 25000,
      damagePercent: 15,
    },
  });

  const [currentShipment, setCurrentShipment] = useState<ShipmentOverview | null>(null);
  const [stats, setStats] = useState<SupplyStats | null>(null);
  const [lookupId, setLookupId] = useState('');
  const [isFetchingShipment, setIsFetchingShipment] = useState(false);

  useEffect(() => {
    if (isReady) {
      fetchSupplyStats()
        .then(setStats)
        .catch((error: any) => {
          console.error(error);
          toast({
            title: 'Failed to load statistics',
            description: error?.message ?? 'Unknown error',
            variant: 'destructive',
          });
        });
    }
  }, [isReady, fetchSupplyStats, toast]);

  const submitShipmentHandler = shipmentForm.handleSubmit(async (data) => {
    try {
      await shipmentProgress.wrap((update) => submitShipment(data, update));
      toast({
        title: 'Shipment submitted',
        description: 'Encrypted cargo manifest stored on-chain',
      });
      shipmentForm.reset();
    } catch (error: any) {
      toast({
        title: 'Shipment failed',
        description: error?.message ?? 'Unable to submit shipment',
        variant: 'destructive',
      });
    }
  });

  const inspectionHandler = inspectionForm.handleSubmit(async (data) => {
    try {
      await inspectionProgress.wrap((update) => conductInspection(data, update));
      toast({
        title: 'Inspection recorded',
        description: 'Quality inspection data secured on-chain',
      });
      inspectionForm.reset();
    } catch (error: any) {
      toast({
        title: 'Inspection failed',
        description: error?.message ?? 'Unable to record inspection',
        variant: 'destructive',
      });
    }
  });

  const checkpointHandler = checkpointForm.handleSubmit(async (data) => {
    try {
      await checkpointProgress.wrap((update) => recordCheckpoint(data, update));
      toast({
        title: 'Checkpoint recorded',
        description: 'Logistics checkpoint saved to blockchain',
      });
      checkpointForm.reset({
        shipmentId: '',
        locationCode: 10101,
        temperatureReading: 283,
        humidityReading: 45,
        scanTimestamp: Math.floor(Date.now() / 1000),
        handlerId: 7,
      });
    } catch (error: any) {
      toast({
        title: 'Checkpoint failed',
        description: error?.message ?? 'Unable to record checkpoint',
        variant: 'destructive',
      });
    }
  });

  const claimHandler = claimForm.handleSubmit(async (data) => {
    try {
      await claimProgress.wrap((update) => fileInsuranceClaim(data, update));
      toast({
        title: 'Claim filed',
        description: 'Insurance claim submitted successfully',
      });
      claimForm.reset();
    } catch (error: any) {
      toast({
        title: 'Claim failed',
        description: error?.message ?? 'Unable to file claim',
        variant: 'destructive',
      });
    }
  });

  const requestClearanceHandler = async () => {
    try {
      await customsProgress.wrap((update) => requestCustomsClearance(lookupId, update));
      toast({
        title: 'Clearance requested',
        description: 'Gateway decryption in progress',
      });
    } catch (error: any) {
      toast({
        title: 'Request failed',
        description: error?.message ?? 'Unable to request clearance',
        variant: 'destructive',
      });
    }
  };

  const markDeliveredHandler = async () => {
    try {
      await deliveryProgress.wrap((update) => markDelivered(lookupId, update));
      toast({
        title: 'Shipment delivered',
        description: 'Delivery status confirmed on-chain',
      });
    } catch (error: any) {
      toast({
        title: 'Delivery failed',
        description: error?.message ?? 'Unable to mark as delivered',
        variant: 'destructive',
      });
    }
  };

  const lookupShipmentHandler = async () => {
    if (!lookupId) {
      toast({ title: 'Enter shipment ID', variant: 'destructive' });
      return;
    }
    setIsFetchingShipment(true);
    try {
      const result = await fetchShipment(lookupId);
      setCurrentShipment(result);
      if (!result) {
        toast({ title: 'Shipment not found', description: 'No data available for this ID' });
      }
    } catch (error: any) {
      toast({
        title: 'Lookup failed',
        description: error?.message ?? 'Unable to fetch shipment',
        variant: 'destructive',
      });
    } finally {
      setIsFetchingShipment(false);
    }
  };

  const statusBanner = useMemo(() => {
    if (!isConnected) {
      return { message: 'Connect wallet to access encrypted supply chain', type: 'warning' as const };
    }
    if (isInitializing) {
      return { message: 'Initializing FHE runtime...', type: 'info' as const };
    }
    if (isWrongNetwork) {
      return { message: 'Please switch to Sepolia testnet', type: 'error' as const };
    }
    if (contractAddress === ZeroAddress) {
      return { message: 'Contract address not configured', type: 'error' as const };
    }
    return { message: 'Connected to encrypted supply chain network', type: 'success' as const };
  }, [isConnected, isInitializing, isWrongNetwork, contractAddress]);

  const isAnyActionRunning =
    shipmentProgress.isLoading ||
    inspectionProgress.isLoading ||
    checkpointProgress.isLoading ||
    claimProgress.isLoading ||
    deliveryProgress.isLoading ||
    customsProgress.isLoading;

  const currentProgressMessage =
    shipmentProgress.message ||
    inspectionProgress.message ||
    checkpointProgress.message ||
    claimProgress.message ||
    deliveryProgress.message ||
    customsProgress.message;

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="border-b border-blue-900/20 bg-slate-950">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-blue-500/20 bg-blue-500/10">
                <Package className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <h1 className="text-lg font-semibold tracking-tight text-slate-50">CipheredSupply</h1>
                <p className="text-xs text-slate-500">Encrypted Logistics Network</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {contractAddress !== ZeroAddress && (
                <div className="hidden rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 font-mono text-xs text-slate-400 md:block">
                  {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
                </div>
              )}
              <ConnectButton chainStatus="icon" showBalance={false} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        {/* Status Banner */}
        <div
          className={`mb-6 flex items-center gap-3 rounded-lg border p-4 ${
            statusBanner.type === 'success'
              ? 'border-emerald-500/20 bg-emerald-500/10'
              : statusBanner.type === 'warning'
                ? 'border-amber-500/20 bg-amber-500/10'
                : statusBanner.type === 'error'
                  ? 'border-red-500/20 bg-red-500/10'
                  : 'border-blue-500/20 bg-blue-500/10'
          }`}
        >
          {statusBanner.type === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : statusBanner.type === 'warning' ? (
            <AlertCircle className="h-5 w-5 text-amber-400" />
          ) : statusBanner.type === 'error' ? (
            <XCircle className="h-5 w-5 text-red-400" />
          ) : (
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
          )}
          <p
            className={`text-sm font-medium ${
              statusBanner.type === 'success'
                ? 'text-emerald-300'
                : statusBanner.type === 'warning'
                  ? 'text-amber-300'
                  : statusBanner.type === 'error'
                    ? 'text-red-300'
                    : 'text-blue-300'
            }`}
          >
            {statusBanner.message}
          </p>
        </div>

        {/* Progress Indicator */}
        {isAnyActionRunning && (
          <div className="mb-6 flex items-center gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
            <p className="text-sm font-medium text-blue-300">{currentProgressMessage}</p>
          </div>
        )}

        {/* Stats Grid */}
        {stats && (
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <StatCard
              title="Total Shipments"
              value={stats.totalShipments.toLocaleString()}
              icon={Package}
              change="+12%"
            />
            <StatCard
              title="Successful Deliveries"
              value={stats.delivered.toLocaleString()}
              icon={CheckCircle2}
              change="+8%"
            />
            <StatCard
              title="Incidents Reported"
              value={stats.lost.toLocaleString()}
              icon={AlertCircle}
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Submit Shipment */}
          <Card className="border-blue-900/20 bg-slate-950">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Truck className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-slate-50">Submit Shipment</CardTitle>
                  <CardDescription className="text-slate-400">
                    Create encrypted cargo manifest
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={submitShipmentHandler}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Shipment ID</Label>
                    <Input
                      placeholder="SHP-2024-001"
                      className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                      {...shipmentForm.register('shipmentId')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Category</Label>
                    <Select
                      value={shipmentForm.watch('category')}
                      onValueChange={(value) => shipmentForm.setValue('category', value as any)}
                    >
                      <SelectTrigger className="border-slate-800 bg-slate-900 text-slate-100">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CARGO_CATEGORIES.map((cat) => (
                          <SelectItem key={cat} value={cat}>
                            {cat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Carrier Address</Label>
                    <Input
                      placeholder="0x..."
                      className="border-slate-800 bg-slate-900 font-mono text-slate-100 focus:border-blue-500"
                      {...shipmentForm.register('carrier')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Receiver Address</Label>
                    <Input
                      placeholder="0x..."
                      className="border-slate-800 bg-slate-900 font-mono text-slate-100 focus:border-blue-500"
                      {...shipmentForm.register('receiver')}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Weight (kg)</Label>
                    <Input
                      type="number"
                      className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                      {...shipmentForm.register('weightKg', numberFieldOptions)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Volume (m³)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                      {...shipmentForm.register('volumeCubicMeters', numberFieldOptions)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Value (USD)</Label>
                    <Input
                      type="number"
                      className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                      {...shipmentForm.register('declaredValue', numberFieldOptions)}
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                  disabled={!isReady || shipmentProgress.isLoading}
                >
                  {shipmentProgress.isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Shipment
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Operations Panel */}
          <Card className="border-blue-900/20 bg-slate-950">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-cyan-500/10 p-2">
                  <ClipboardList className="h-5 w-5 text-cyan-400" />
                </div>
                <div>
                  <CardTitle className="text-slate-50">Operations</CardTitle>
                  <CardDescription className="text-slate-400">
                    Inspection, customs clearance & tracking
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="inspection" className="w-full">
                <TabsList className="grid w-full grid-cols-3 bg-slate-900">
                  <TabsTrigger value="inspection">Inspection</TabsTrigger>
                  <TabsTrigger value="customs">Customs</TabsTrigger>
                  <TabsTrigger value="checkpoint">Tracking</TabsTrigger>
                </TabsList>

                <TabsContent value="inspection" className="mt-4 space-y-4">
                  <form onSubmit={inspectionHandler} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Shipment ID</Label>
                      <Input
                        placeholder="SHP-2024-001"
                        className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                        {...inspectionForm.register('shipmentId')}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Condition Score</Label>
                        <Input
                          type="number"
                          className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                          {...inspectionForm.register('conditionScore', numberFieldOptions)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Packaging Score</Label>
                        <Input
                          type="number"
                          className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                          {...inspectionForm.register('packagingScore', numberFieldOptions)}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-cyan-600 hover:bg-cyan-700"
                      disabled={!isReady || inspectionProgress.isLoading}
                    >
                      {inspectionProgress.isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        'Submit Inspection'
                      )}
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="customs" className="mt-4 space-y-4">
                  <div className="space-y-2">
                    <Label className="text-slate-300">Shipment ID</Label>
                    <Input
                      placeholder="SHP-2024-001"
                      value={lookupId}
                      onChange={(e) => setLookupId(e.target.value)}
                      className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                    />
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button
                      onClick={requestClearanceHandler}
                      disabled={!lookupId || !isReady || customsProgress.isLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {customsProgress.isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Shield className="mr-2 h-4 w-4" />
                      )}
                      Request Clearance
                    </Button>
                    <Button
                      onClick={markDeliveredHandler}
                      disabled={!lookupId || !isReady || deliveryProgress.isLoading}
                      className="bg-emerald-600 hover:bg-emerald-700"
                    >
                      {deliveryProgress.isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                      )}
                      Mark Delivered
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="checkpoint" className="mt-4 space-y-4">
                  <form onSubmit={checkpointHandler} className="space-y-4">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Shipment ID</Label>
                      <Input
                        placeholder="SHP-2024-001"
                        className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                        {...checkpointForm.register('shipmentId')}
                      />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label className="text-slate-300">Location Code</Label>
                        <Input
                          type="number"
                          className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                          {...checkpointForm.register('locationCode', numberFieldOptions)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-slate-300">Handler ID</Label>
                        <Input
                          type="number"
                          className="border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                          {...checkpointForm.register('handlerId', numberFieldOptions)}
                        />
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-700"
                      disabled={!isReady || checkpointProgress.isLoading}
                    >
                      {checkpointProgress.isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Recording...
                        </>
                      ) : (
                        <>
                          <Activity className="mr-2 h-4 w-4" />
                          Record Checkpoint
                        </>
                      )}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Shipment Lookup */}
          <Card className="border-blue-900/20 bg-slate-950 lg:col-span-2">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-blue-500/10 p-2">
                  <Search className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-slate-50">Shipment Lookup</CardTitle>
                  <CardDescription className="text-slate-400">
                    Query encrypted shipment data
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter shipment ID or 0x hash"
                  value={lookupId}
                  onChange={(e) => setLookupId(e.target.value)}
                  className="flex-1 border-slate-800 bg-slate-900 text-slate-100 focus:border-blue-500"
                />
                <Button
                  onClick={lookupShipmentHandler}
                  disabled={!lookupId || !isReady || isFetchingShipment}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isFetchingShipment ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Search
                    </>
                  )}
                </Button>
              </div>
              {currentShipment && <ShipmentOverviewCard data={currentShipment} />}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
