import React, { useState } from 'react';
import { keccak256, toUtf8Bytes } from 'ethers';
import {
  Layout,
  Card,
  Button,
  Form,
  Input,
  Select,
  Modal,
  Tag,
  Space,
  Alert,
  message,
  notification,
  InputNumber,
  Row,
  Col,
  Divider,
  Typography,
} from 'antd';
import { useAccount, useChainId } from 'wagmi';
import { getTransactionUrl, shortenHash, getExplorerName } from '@/utils/explorer';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import {
  InboxOutlined,
  LoadingOutlined,
  SafetyOutlined,
  ThunderboltOutlined,
  CheckCircleOutlined,
  RocketOutlined,
  LinkOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons';
import {
  useSimplifiedSupplyLedger,
  SimplifiedShipmentFormValues,
  CARGO_CATEGORIES
} from '@/hooks/useSimplifiedSupplyLedger';

const { Title, Text, Paragraph } = Typography;

const SimplifiedDApp: React.FC = () => {
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shipmentForm] = Form.useForm();

  const {
    submitShipment,
    startTransit,
    markDelivered,
    fetchSupplyStats,
    isReady,
    contractAddress,
  } = useSimplifiedSupplyLedger();

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

  const showTransactionError = (error: any, txHash?: string) => {
    const explorerUrl = txHash ? getTransactionUrl(txHash, chainId) : null;
    const explorerName = getExplorerName(chainId);

    notification.error({
      message: 'Transaction Failed',
      description: (
        <div>
          <p style={{ marginBottom: 8, color: '#ff4d4f' }}>
            {error?.shortMessage || error?.message || 'Transaction failed'}
          </p>
          {txHash && explorerUrl && (
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
          )}
        </div>
      ),
      duration: 15,
      placement: 'topRight',
      icon: <CloseCircleOutlined style={{ color: '#ff4d4f' }} />,
    });
  };

  const showTransactionPending = (txHash: string) => {
    const explorerUrl = getTransactionUrl(txHash, chainId);
    const explorerName = getExplorerName(chainId);

    notification.info({
      key: `tx-pending-${txHash}`,
      message: 'Transaction Pending',
      description: (
        <div>
          <p style={{ marginBottom: 8 }}>
            <LoadingOutlined spin style={{ marginRight: 8 }} />
            Waiting for on-chain confirmation...
          </p>
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
            Track on {explorerName}: {shortenHash(txHash)}
          </a>
        </div>
      ),
      duration: 0,
      placement: 'topRight',
    });
  };

  const closeTransactionPending = (txHash: string) => {
    notification.destroy(`tx-pending-${txHash}`);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    shipmentForm.resetFields();
  };

  const handleSubmitShipment = async (values: any) => {
    if (!isConnected || !address) {
      message.error('Please connect your wallet first');
      return;
    }

    if (!isReady) {
      message.error('Contract is still initializing, please wait...');
      return;
    }

    setLoading(true);
    let currentTxHash: string | undefined;

    const hideLoading = message.loading({
      content: '🔐 Encrypting shipment value... (Expected: 10-20 seconds)',
      duration: 0,
      key: 'encrypt-loading',
    });

    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Generate unique shipment ID
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000000);
      const description = values.shipmentDescription || 'SHIPMENT';
      const uniqueString = `${address}-${description}-${timestamp}-${random}`;
      const uniqueId = keccak256(toUtf8Bytes(uniqueString));

      console.log('Generated shipment ID:', uniqueId);

      const shipmentData: SimplifiedShipmentFormValues = {
        shipmentId: uniqueId,
        carrier: values.carrier,
        receiver: values.receiver,
        // Only 4 encrypted parameters
        weightKg: values.weightKg || 1000,
        declaredValue: values.declaredValue || 50000,
        quantity: values.quantity || 100,
        riskCode: values.riskCode || 1,
        // Plaintext parameters
        temperature: values.temperature || 273,
        humidity: values.humidity || 50,
        priority: values.priority || 500,
        category: values.category || 'Electronics',
      };

      console.log('Submitting simplified shipment:', shipmentData);

      const result = await submitShipment(shipmentData, (progressMsg) => {
        // Check if the message contains a tx hash (means tx was submitted)
        if (progressMsg.includes('0x') && progressMsg.includes('Waiting')) {
          hideLoading();
          // Extract tx hash from message for pending notification
          const hashMatch = progressMsg.match(/(0x[a-fA-F0-9]+)/);
          if (hashMatch) {
            currentTxHash = hashMatch[1];
            showTransactionPending(currentTxHash);
          }
        } else {
          message.loading({
            content: progressMsg,
            duration: 0,
            key: 'encrypt-loading',
          });
        }
      });

      // Close pending notification
      if (result.txHash) {
        closeTransactionPending(result.txHash);
      }

      hideLoading();

      // Show success notification with transaction link
      showTransactionSuccess(
        result.txHash,
        'Shipment Submitted Successfully',
        `Shipment ID: ${uniqueId.substring(0, 10)}... has been recorded on-chain.`
      );

      handleModalClose();
    } catch (error: any) {
      console.error('Failed to submit shipment:', error);
      hideLoading();

      // Close pending notification if exists
      if (currentTxHash) {
        closeTransactionPending(currentTxHash);
      }

      // Show error notification with transaction link if available
      showTransactionError(error, error?.txHash || currentTxHash);
    } finally {
      setLoading(false);
    }
  };

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
            <h2 style={{ color: '#E5E7EB', fontSize: 32, marginBottom: 16 }}>
              Connect Your Wallet
            </h2>
            <p style={{ color: '#94A3B8', fontSize: 18, marginBottom: 32 }}>
              Please connect your wallet to access the Simplified Supply Ledger
            </p>
            <ConnectButton />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: '#050709', minHeight: 'calc(100vh - 64px)', padding: '40px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <Title style={{ color: '#E5E7EB', fontSize: 42, marginBottom: 16 }}>
              <ThunderboltOutlined style={{ color: '#2563EB', marginRight: 16 }} />
              CipheredSupply Ledger
            </Title>
            <Paragraph style={{ color: '#94A3B8', fontSize: 18, maxWidth: 700, margin: '0 auto' }}>
              Privacy-preserving supply chain management powered by Zama's Fully Homomorphic Encryption.
              Track shipments with encrypted sensitive data while maintaining full transparency.
            </Paragraph>
          </div>
        </motion.div>

        {/* Performance Metrics */}
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
                <div style={{ textAlign: 'center' }}>
                  <RocketOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                  <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>4</div>
                  <div style={{ color: '#fff', opacity: 0.9 }}>Encrypted Parameters</div>
                  <div style={{ fontSize: 12, color: '#fff', opacity: 0.7, marginTop: 8 }}>
                    Weight, Value, Quantity, Risk
                  </div>
                </div>
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
                <div style={{ textAlign: 'center' }}>
                  <ThunderboltOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                  <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>~15s</div>
                  <div style={{ color: '#fff', opacity: 0.9 }}>Encryption Time</div>
                  <div style={{ fontSize: 12, color: '#fff', opacity: 0.7, marginTop: 8 }}>
                    Fast FHE operations
                  </div>
                </div>
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
                <div style={{ textAlign: 'center' }}>
                  <CheckCircleOutlined style={{ fontSize: 32, color: '#fff', marginBottom: 8 }} />
                  <div style={{ fontSize: 36, fontWeight: 'bold', color: '#fff' }}>70%</div>
                  <div style={{ color: '#fff', opacity: 0.9 }}>Gas Reduction</div>
                  <div style={{ fontSize: 12, color: '#fff', opacity: 0.7, marginTop: 8 }}>
                    Optimized FHE operations
                  </div>
                </div>
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
              message="Contract Deployed"
              description={
                <div>
                  <Text style={{ color: '#94A3B8' }}>Address: </Text>
                  <Text code style={{ color: '#2563EB' }}>{contractAddress}</Text>
                </div>
              }
              type="success"
              showIcon
              style={{ marginBottom: 24 }}
            />
          </motion.div>
        )}

        {/* Main Actions */}
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
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <InboxOutlined style={{ fontSize: 64, color: '#2563EB', marginBottom: 24 }} />
              <Title level={3} style={{ color: '#E5E7EB', marginBottom: 16 }}>
                Submit New Shipment
              </Title>
              <Paragraph style={{ color: '#94A3B8', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>
                Create a new supply chain shipment with fully encrypted sensitive data including weight, declared value, quantity, and risk assessment.
              </Paragraph>
              <Button
                type="primary"
                size="large"
                icon={<InboxOutlined />}
                onClick={() => setModalVisible(true)}
                style={{
                  background: '#2563EB',
                  borderColor: '#2563EB',
                  height: 48,
                  padding: '0 32px',
                  fontSize: 16,
                }}
              >
                Create Shipment
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Submit Shipment Modal */}
        <Modal
          title="Submit New Shipment"
          open={modalVisible}
          onCancel={handleModalClose}
          footer={null}
          width={700}
        >
          <Alert
            message="Privacy-First Supply Chain"
            description="Sensitive shipment data (weight, value, quantity, risk) are encrypted using Zama's FHE technology, ensuring complete privacy while enabling on-chain verification."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />

          <Form
            form={shipmentForm}
            layout="vertical"
            onFinish={handleSubmitShipment}
            initialValues={{
              weightKg: 1000,
              quantity: 100,
              declaredValue: 50000,
              riskCode: 1,
              temperature: 273,
              humidity: 50,
              priority: 500,
              category: 'Electronics',
            }}
          >
            <Divider orientation="left">Basic Information</Divider>

            <Row gutter={16}>
              <Col span={24}>
                <Form.Item
                  name="shipmentDescription"
                  label="Shipment Description (Optional)"
                  tooltip="A friendly name for this shipment"
                >
                  <Input placeholder="e.g., Electronics-NYC" size="large" />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="carrier"
                  label="Carrier Address"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="0x..." />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="receiver"
                  label="Receiver Address"
                  rules={[{ required: true, message: 'Required' }]}
                >
                  <Input placeholder="0x..." />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Encrypted Parameters (4 only)</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="weightKg"
                  label={
                    <span>
                      Weight (kg) <Tag color="blue">Encrypted</Tag>
                    </span>
                  }
                >
                  <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="declaredValue"
                  label={
                    <span>
                      Value ($) <Tag color="blue">Encrypted</Tag>
                    </span>
                  }
                >
                  <InputNumber
                    style={{ width: '100%' }}
                    min={1}
                    formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value: any) => value!.replace(/\$\s?|(,*)/g, '')}
                  />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="quantity"
                  label={
                    <span>
                      Quantity <Tag color="blue">Encrypted</Tag>
                    </span>
                  }
                >
                  <InputNumber style={{ width: '100%' }} min={1} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="riskCode"
                  label={
                    <span>
                      Risk Code (0-5) <Tag color="blue">Encrypted</Tag>
                    </span>
                  }
                  tooltip="0 = Minimal, 5 = Critical"
                >
                  <InputNumber style={{ width: '100%' }} min={0} max={5} />
                </Form.Item>
              </Col>
            </Row>

            <Divider orientation="left">Additional Parameters</Divider>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="category"
                  label={
                    <span>
                      Category <Tag color="green">Plaintext</Tag>
                    </span>
                  }
                >
                  <Select>
                    {CARGO_CATEGORIES.map(cat => (
                      <Select.Option key={cat} value={cat}>{cat}</Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="priority"
                  label={
                    <span>
                      Priority Score <Tag color="green">Plaintext</Tag>
                    </span>
                  }
                >
                  <InputNumber style={{ width: '100%' }} min={1} max={1000} />
                </Form.Item>
              </Col>
            </Row>

            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="temperature"
                  label={
                    <span>
                      Temperature (K) <Tag color="green">Plaintext</Tag>
                    </span>
                  }
                  tooltip="Temperature in Kelvin (273 = 0°C)"
                >
                  <InputNumber style={{ width: '100%' }} min={200} max={400} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item
                  name="humidity"
                  label={
                    <span>
                      Humidity (%) <Tag color="green">Plaintext</Tag>
                    </span>
                  }
                >
                  <InputNumber style={{ width: '100%' }} min={0} max={100} />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item>
              <Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  disabled={!isReady || loading}
                  size="large"
                  icon={<RocketOutlined />}
                >
                  {!isReady ? 'Initializing...' : 'Submit Shipment'}
                </Button>
                <Button onClick={handleModalClose} size="large">Cancel</Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </div>
  );
};

export default SimplifiedDApp;