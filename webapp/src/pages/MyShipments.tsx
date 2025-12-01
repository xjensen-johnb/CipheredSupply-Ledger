import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Space,
  Alert,
  message,
  notification,
  Tabs,
  Empty,
  Spin,
  Typography,
  Badge,
  Tooltip,
  Row,
  Col,
  Statistic,
} from 'antd';
import { useAccount, useChainId } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import {
  InboxOutlined,
  LoadingOutlined,
  SafetyOutlined,
  ReloadOutlined,
  SendOutlined,
  CarOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  CloseCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons';
import {
  useSimplifiedSupplyLedger,
  SimplifiedShipmentInfo,
  SHIPMENT_STATUS,
} from '@/hooks/useSimplifiedSupplyLedger';
import { getTransactionUrl, shortenHash, getExplorerName } from '@/utils/explorer';
import { decodeBytes32String } from 'ethers';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

// Status color mapping
const getStatusConfig = (statusIndex: number) => {
  const configs: Record<number, { color: string; icon: React.ReactNode; text: string }> = {
    0: { color: 'default', icon: <ClockCircleOutlined />, text: 'Draft' },
    1: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Submitted' },
    2: { color: 'blue', icon: <CarOutlined />, text: 'In Transit' },
    3: { color: 'success', icon: <CheckCircleOutlined />, text: 'Delivered' },
    4: { color: 'error', icon: <CloseCircleOutlined />, text: 'Lost' },
  };
  return configs[statusIndex] || { color: 'default', icon: <ExclamationCircleOutlined />, text: 'Unknown' };
};

// Format shipment ID for display
const formatShipmentId = (id: string): string => {
  try {
    // Try to decode as bytes32 string
    const decoded = decodeBytes32String(id);
    if (decoded && decoded.length > 0) {
      return decoded;
    }
  } catch {
    // If decoding fails, show shortened hex
  }
  return `${id.substring(0, 10)}...${id.substring(id.length - 6)}`;
};

// Format timestamp
const formatTimestamp = (timestamp: number): string => {
  if (!timestamp || timestamp === 0) return '-';
  return new Date(timestamp * 1000).toLocaleString();
};

const MyShipments: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [shipments, setShipments] = useState<{
    asShipper: SimplifiedShipmentInfo[];
    asCarrier: SimplifiedShipmentInfo[];
    asReceiver: SimplifiedShipmentInfo[];
  }>({ asShipper: [], asCarrier: [], asReceiver: [] });

  const {
    fetchUserShipments,
    fetchShipperShipmentCount,
    startTransit,
    markDelivered,
    markLost,
    isReady,
    contractAddress,
  } = useSimplifiedSupplyLedger();

  // Load shipments
  const loadShipments = useCallback(async () => {
    if (!isReady || !address) return;

    setLoading(true);
    try {
      const data = await fetchUserShipments();
      setShipments(data);
      message.success('Shipments loaded successfully');
    } catch (error: any) {
      console.error('Failed to load shipments:', error);
      message.error('Failed to load shipments: ' + (error?.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  }, [fetchUserShipments, isReady, address]);

  // Auto-load on mount
  useEffect(() => {
    if (isReady && address) {
      loadShipments();
    }
  }, [isReady, address]);

  // Transaction notification helpers
  const showTransactionSuccess = (txHash: string, title: string, description: string) => {
    const explorerUrl = getTransactionUrl(txHash, chainId);
    const explorerName = getExplorerName(chainId);

    notification.success({
      message: title,
      description: (
        <div>
          <p style={{ marginBottom: 8 }}>{description}</p>
          <a
            href={explorerUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              color: '#1890ff',
            }}
          >
            <LinkOutlined />
            View on {explorerName}: {shortenHash(txHash)}
          </a>
        </div>
      ),
      duration: 10,
      placement: 'topRight',
    });
  };

  // Handle start transit
  const handleStartTransit = async (shipmentId: string) => {
    setActionLoading(shipmentId);
    try {
      const result = await startTransit(shipmentId, (msg) => {
        message.loading({ content: msg, key: 'action' });
      });
      message.destroy('action');
      showTransactionSuccess(result.txHash, 'Shipment In Transit', 'Shipment status updated to In Transit');
      await loadShipments();
    } catch (error: any) {
      message.destroy('action');
      message.error('Failed to start transit: ' + (error?.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle mark delivered
  const handleMarkDelivered = async (shipmentId: string) => {
    setActionLoading(shipmentId);
    try {
      const result = await markDelivered(shipmentId, (msg) => {
        message.loading({ content: msg, key: 'action' });
      });
      message.destroy('action');
      showTransactionSuccess(result.txHash, 'Shipment Delivered', 'Shipment marked as delivered');
      await loadShipments();
    } catch (error: any) {
      message.destroy('action');
      message.error('Failed to mark delivered: ' + (error?.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  // Handle mark lost
  const handleMarkLost = async (shipmentId: string) => {
    setActionLoading(shipmentId);
    try {
      const result = await markLost(shipmentId, (msg) => {
        message.loading({ content: msg, key: 'action' });
      });
      message.destroy('action');
      showTransactionSuccess(result.txHash, 'Shipment Lost', 'Shipment marked as lost');
      await loadShipments();
    } catch (error: any) {
      message.destroy('action');
      message.error('Failed to mark lost: ' + (error?.message || 'Unknown error'));
    } finally {
      setActionLoading(null);
    }
  };

  // Table columns
  const getColumns = (role: 'shipper' | 'carrier' | 'receiver') => [
    {
      title: 'Shipment ID',
      dataIndex: 'shipmentId',
      key: 'shipmentId',
      render: (id: string) => (
        <Tooltip title={id}>
          <Text code style={{ fontSize: 12 }}>{formatShipmentId(id)}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'categoryLabel',
      key: 'category',
      render: (cat: string) => <Tag color="purple">{cat}</Tag>,
    },
    {
      title: 'Status',
      dataIndex: 'statusIndex',
      key: 'status',
      render: (status: number) => {
        const config = getStatusConfig(status);
        return (
          <Tag color={config.color} icon={config.icon}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: role === 'shipper' ? 'Carrier' : role === 'carrier' ? 'Shipper' : 'Carrier',
      dataIndex: role === 'shipper' ? 'carrier' : role === 'receiver' ? 'carrier' : 'shipper',
      key: 'counterparty',
      render: (addr: string) => (
        <Tooltip title={addr}>
          <Text style={{ fontSize: 12 }}>{shortenHash(addr)}</Text>
        </Tooltip>
      ),
    },
    {
      title: 'Submitted',
      dataIndex: 'submittedAt',
      key: 'submittedAt',
      render: (ts: number) => <Text style={{ fontSize: 12 }}>{formatTimestamp(ts)}</Text>,
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (p: number) => (
        <Badge
          count={p}
          style={{ backgroundColor: p > 500 ? '#f5222d' : p > 300 ? '#fa8c16' : '#52c41a' }}
        />
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: SimplifiedShipmentInfo) => {
        const isLoading = actionLoading === record.shipmentId;
        const canStartTransit = role === 'carrier' && record.statusIndex === 1;
        const canMarkDelivered = (role === 'carrier' || role === 'receiver') && record.statusIndex === 2;
        const canMarkLost = (role === 'shipper' || role === 'carrier') && record.isActive;

        return (
          <Space size="small">
            {canStartTransit && (
              <Tooltip title="Start Transit">
                <Button
                  type="primary"
                  size="small"
                  icon={<CarOutlined />}
                  loading={isLoading}
                  onClick={() => handleStartTransit(record.shipmentId)}
                >
                  Start
                </Button>
              </Tooltip>
            )}
            {canMarkDelivered && (
              <Tooltip title="Mark Delivered">
                <Button
                  type="primary"
                  size="small"
                  icon={<CheckCircleOutlined />}
                  loading={isLoading}
                  onClick={() => handleMarkDelivered(record.shipmentId)}
                  style={{ background: '#52c41a', borderColor: '#52c41a' }}
                >
                  Deliver
                </Button>
              </Tooltip>
            )}
            {canMarkLost && record.statusIndex < 3 && (
              <Tooltip title="Mark Lost">
                <Button
                  danger
                  size="small"
                  icon={<CloseCircleOutlined />}
                  loading={isLoading}
                  onClick={() => handleMarkLost(record.shipmentId)}
                >
                  Lost
                </Button>
              </Tooltip>
            )}
            {!canStartTransit && !canMarkDelivered && record.statusIndex >= 3 && (
              <Tag color={record.statusIndex === 3 ? 'success' : 'error'}>
                {record.statusIndex === 3 ? 'Completed' : 'Closed'}
              </Tag>
            )}
          </Space>
        );
      },
    },
  ];

  // Count stats
  const totalShipments =
    shipments.asShipper.length + shipments.asCarrier.length + shipments.asReceiver.length;
  const activeShipments = [
    ...shipments.asShipper,
    ...shipments.asCarrier,
    ...shipments.asReceiver,
  ].filter((s) => s.isActive).length;
  const deliveredShipments = [
    ...shipments.asShipper,
    ...shipments.asCarrier,
    ...shipments.asReceiver,
  ].filter((s) => s.statusIndex === 3).length;

  if (!isConnected) {
    return (
      <div style={{ background: '#050709', minHeight: 'calc(100vh - 64px)', padding: '80px 24px' }}>
        <div style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <SafetyOutlined style={{ fontSize: 64, color: '#2563EB', marginBottom: 24 }} />
            <h2 style={{ color: '#E5E7EB', fontSize: 32, marginBottom: 16 }}>Connect Your Wallet</h2>
            <p style={{ color: '#94A3B8', fontSize: 18, marginBottom: 32 }}>
              Please connect your wallet to view your shipments
            </p>
            <ConnectButton />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#050709', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1400, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title style={{ color: '#E5E7EB', fontSize: 42, marginBottom: 16 }}>
              <InboxOutlined style={{ color: '#2563EB', marginRight: 16 }} />
              My Shipments
            </Title>
            <Paragraph style={{ color: '#94A3B8', fontSize: 18, maxWidth: 700, margin: '0 auto' }}>
              View and manage all your supply chain shipments. Track items you've sent, are
              carrying, or are receiving.
            </Paragraph>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            <Col xs={24} md={8}>
              <Card
                bordered={false}
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Total Shipments</span>}
                  value={totalShipments}
                  valueStyle={{ color: '#fff', fontSize: 36 }}
                  prefix={<InboxOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                bordered={false}
                style={{
                  background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                  border: 'none',
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Active</span>}
                  value={activeShipments}
                  valueStyle={{ color: '#fff', fontSize: 36 }}
                  prefix={<CarOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card
                bordered={false}
                style={{
                  background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                  border: 'none',
                }}
              >
                <Statistic
                  title={<span style={{ color: 'rgba(255,255,255,0.85)' }}>Delivered</span>}
                  value={deliveredShipments}
                  valueStyle={{ color: '#fff', fontSize: 36 }}
                  prefix={<CheckCircleOutlined />}
                />
              </Card>
            </Col>
          </Row>
        </motion.div>

        {/* Contract Info */}
        {contractAddress && contractAddress !== '0x0000000000000000000000000000000000000000' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Alert
              message="Connected to Contract"
              description={
                <Text style={{ color: '#94A3B8' }}>
                  Address: <Text code style={{ color: '#2563EB' }}>{contractAddress}</Text>
                </Text>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
              action={
                <Button
                  icon={<ReloadOutlined spin={loading} />}
                  onClick={loadShipments}
                  loading={loading}
                >
                  Refresh
                </Button>
              }
            />
          </motion.div>
        )}

        {/* Shipments Tabs */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Card
            bordered={false}
            style={{
              background: '#0F1419',
              border: '1px solid #1E293B',
            }}
          >
            <Spin spinning={loading} indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}>
              <Tabs
                defaultActiveKey="shipper"
                items={[
                  {
                    key: 'shipper',
                    label: (
                      <span>
                        <SendOutlined />
                        As Shipper
                        <Badge
                          count={shipments.asShipper.length}
                          style={{ marginLeft: 8, backgroundColor: '#2563EB' }}
                        />
                      </span>
                    ),
                    children:
                      shipments.asShipper.length === 0 ? (
                        <Empty
                          description="No shipments created by you"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <Table
                          dataSource={shipments.asShipper}
                          columns={getColumns('shipper')}
                          rowKey="shipmentId"
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: 900 }}
                        />
                      ),
                  },
                  {
                    key: 'carrier',
                    label: (
                      <span>
                        <CarOutlined />
                        As Carrier
                        <Badge
                          count={shipments.asCarrier.length}
                          style={{ marginLeft: 8, backgroundColor: '#722ed1' }}
                        />
                      </span>
                    ),
                    children:
                      shipments.asCarrier.length === 0 ? (
                        <Empty
                          description="No shipments assigned to you as carrier"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <Table
                          dataSource={shipments.asCarrier}
                          columns={getColumns('carrier')}
                          rowKey="shipmentId"
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: 900 }}
                        />
                      ),
                  },
                  {
                    key: 'receiver',
                    label: (
                      <span>
                        <DownloadOutlined />
                        As Receiver
                        <Badge
                          count={shipments.asReceiver.length}
                          style={{ marginLeft: 8, backgroundColor: '#13c2c2' }}
                        />
                      </span>
                    ),
                    children:
                      shipments.asReceiver.length === 0 ? (
                        <Empty
                          description="No shipments addressed to you"
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                      ) : (
                        <Table
                          dataSource={shipments.asReceiver}
                          columns={getColumns('receiver')}
                          rowKey="shipmentId"
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: 900 }}
                        />
                      ),
                  },
                ]}
              />
            </Spin>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default MyShipments;
