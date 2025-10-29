import React, { useState, useEffect, useMemo } from 'react';
import { keccak256, toUtf8Bytes } from 'ethers';
import {
  Layout,
  Tabs,
  Card,
  Table,
  Button,
  Form,
  Input,
  Select,
  Modal,
  Tag,
  Space,
  Statistic,
  Row,
  Col,
  Alert,
  Badge,
  message,
  Spin,
  Empty,
  Divider,
  InputNumber,
  DatePicker,
} from 'antd';
import { useAccount } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { motion } from 'framer-motion';
import {
  InboxOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  TruckOutlined,
  FileProtectOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  LoadingOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  DollarOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { format } from 'date-fns';
import { useSupplyLedgerContract, ShipmentOverview, SupplyStats } from '@/hooks/useSupplyLedgerContract';
import { CARGO_CATEGORIES } from '@/contracts/cipheredSupplyLedger';

const { Content } = Layout;
const { TabPane } = Tabs;

const DApp: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [activeTab, setActiveTab] = useState('shipments');
  const [modalVisible, setModalVisible] = useState(false);
  const [modalType, setModalType] = useState<string>('');
  const [selectedShipment, setSelectedShipment] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [shipmentForm] = Form.useForm();
  const [inspectionForm] = Form.useForm();
  const [customsForm] = Form.useForm();
  const [checkpointForm] = Form.useForm();
  const [claimForm] = Form.useForm();

  const {
    submitShipment,
    recordInspection,
    processCustomsClearance,
    recordCheckpoint,
    processClaim,
    getSupplyStats,
    getShipmentOverview,
    isSubmittingShipment,
    isRecordingInspection,
    isProcessingCustomsClearance,
    isRecordingCheckpoint,
    isProcessingClaim,
  } = useSupplyLedgerContract();

  // Mock data for demonstration
  const mockShipments = [
    {
      key: '1',
      id: 'SHIP-2024-001',
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
      status: 'In Transit',
      value: '$45,000',
      category: 'Electronics',
      date: '2024-10-15',
    },
    {
      key: '2',
      id: 'SHIP-2024-002',
      origin: 'Mumbai, India',
      destination: 'Dubai, UAE',
      status: 'Customs Clearance',
      value: '$28,000',
      category: 'Textiles',
      date: '2024-10-14',
    },
    {
      key: '3',
      id: 'SHIP-2024-003',
      origin: 'Hamburg, Germany',
      destination: 'New York, USA',
      status: 'Delivered',
      value: '$92,000',
      category: 'Automotive',
      date: '2024-10-10',
    },
  ];

  const stats = [
    {
      title: 'Total Shipments',
      value: 1234,
      icon: <InboxOutlined />,
      color: '#2563EB',
      change: '+12.5%',
    },
    {
      title: 'Active Routes',
      value: 89,
      icon: <TruckOutlined />,
      color: '#0EA5E9',
      change: '+5.2%',
    },
    {
      title: 'Inspections Passed',
      value: '98.5%',
      icon: <CheckCircleOutlined />,
      color: '#10B981',
      change: '+2.1%',
    },
    {
      title: 'Insurance Claims',
      value: 23,
      icon: <FileProtectOutlined />,
      color: '#06B6D4',
      change: '-3.8%',
    },
  ];

  const shipmentColumns = [
    {
      title: 'Shipment ID',
      dataIndex: 'id',
      key: 'id',
      render: (text: string) => (
        <Space>
          <InboxOutlined style={{ color: '#2563EB' }} />
          <span style={{ fontFamily: 'monospace', color: '#E5E7EB' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Origin',
      dataIndex: 'origin',
      key: 'origin',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#94A3B8' }} />
          <span style={{ color: '#E5E7EB' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Destination',
      dataIndex: 'destination',
      key: 'destination',
      render: (text: string) => (
        <Space>
          <EnvironmentOutlined style={{ color: '#94A3B8' }} />
          <span style={{ color: '#E5E7EB' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colors: any = {
          'In Transit': 'blue',
          'Customs Clearance': 'orange',
          'Delivered': 'green',
          'Pending': 'default',
        };
        return <Tag color={colors[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Value',
      dataIndex: 'value',
      key: 'value',
      render: (text: string) => <span style={{ color: '#10B981', fontWeight: 600 }}>{text}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (text: string) => <Tag color="cyan">{text}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (text: string) => (
        <Space>
          <CalendarOutlined style={{ color: '#94A3B8' }} />
          <span style={{ color: '#94A3B8' }}>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <Space>
          <Button
            type="link"
            size="small"
            onClick={() => handleViewDetails(record)}
          >
            View
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => handleActionClick('checkpoint', record)}
          >
            Track
          </Button>
        </Space>
      ),
    },
  ];

  const handleViewDetails = (record: any) => {
    setSelectedShipment(record);
    message.info(`Viewing details for ${record.id}`);
  };

  const handleActionClick = (type: string, shipment?: any) => {
    setModalType(type);
    setSelectedShipment(shipment);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setModalType('');
    setSelectedShipment(null);
    shipmentForm.resetFields();
    inspectionForm.resetFields();
    customsForm.resetFields();
    checkpointForm.resetFields();
    claimForm.resetFields();
  };

  const handleSubmitShipment = async (values: any) => {
    // Check wallet connection first
    if (!isConnected || !address) {
      message.error({
        content: 'Please connect your wallet first',
        duration: 5,
        icon: <LoadingOutlined />,
      });
      return;
    }

    // CRITICAL: Set loading state FIRST
    setLoading(true);

    // Force immediate UI update with a visible loading message
    const hideLoading = message.loading({
      content: 'Encrypting shipment data... This may take 20-30 seconds',
      duration: 0,
      key: 'encrypt-loading',
    });

    // Small delay to ensure React has rendered the loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      // Generate unique shipment ID using keccak256 hash
      const timestamp = Date.now();
      const random = Math.floor(Math.random() * 1000000000);
      const description = values.shipmentDescription || 'SHIPMENT';
      const uniqueString = `${address}-${description}-${timestamp}-${random}`;
      const uniqueId = keccak256(toUtf8Bytes(uniqueString));

      console.log('Generated unique shipment ID (hash):', uniqueId);
      console.log('Based on string:', uniqueString);

      // Ensure all required fields have values with defaults
      const shipmentData = {
        shipmentId: uniqueId,
        carrier: values.carrier,
        receiver: values.receiver,
        weightKg: values.weightKg || 1000,
        volumeCubicMeters: values.volumeCubicMeters || 10,
        declaredValue: values.declaredValue || 50000,
        quantity: values.quantity || 100,
        requiredTemperature: values.requiredTemperature || 273,
        requiredHumidity: values.requiredHumidity || 50,
        fragilityScore: values.fragilityScore || 5,
        priorityScore: values.priorityScore || 500,
        riskCode: values.riskCode || 1,
        category: values.category || 'Electronics',
      };

      console.log('Submitting shipment with values:', shipmentData);
      console.log('Starting encryption and submission...');

      try {
        // Update loading message during encryption
        message.loading({
          content: '🔐 Encrypting 9 parameters... Please wait',
          duration: 0,
          key: 'encrypt-loading',
        });

        await submitShipment(shipmentData, (progressMsg) => {
          // Update message with progress
          message.loading({
            content: progressMsg,
            duration: 0,
            key: 'encrypt-loading',
          });
        });

        console.log('Submission completed successfully');

        hideLoading();
        message.success(`Shipment submitted successfully! ID: ${uniqueId.substring(0, 10)}...${uniqueId.substring(uniqueId.length - 6)}`);
        handleModalClose();
      } catch (submitError: any) {
        console.error('Submit error:', submitError);
        throw submitError; // Re-throw to outer catch
      }
    } catch (error: any) {
      console.error('Failed to submit shipment:', error);
      console.error('Error details:', {
        message: error?.message,
        code: error?.code,
        stack: error?.stack,
      });
      hideLoading();
      message.error(error?.message || 'Failed to submit shipment');
    } finally {
      console.log('Cleaning up, setting loading to false');
      setLoading(false);
    }
  };

  const renderModal = () => {
    switch (modalType) {
      case 'shipment':
        return (
          <Modal
            title="Submit New Shipment"
            visible={modalVisible}
            onCancel={handleModalClose}
            footer={null}
            width={700}
          >
            <Form
              form={shipmentForm}
              layout="vertical"
              onFinish={handleSubmitShipment}
              initialValues={{
                weightKg: 1000,
                volumeCubicMeters: 10,
                quantity: 100,
                declaredValue: 50000,
                requiredTemperature: 273,
                requiredHumidity: 50,
                fragilityScore: 5,
                priorityScore: 500,
                riskCode: 1,
                category: 'Electronics',
              }}
            >
              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="shipmentDescription"
                    label="Shipment Description (Optional)"
                    tooltip="A friendly name for this shipment. System will auto-generate a unique ID."
                  >
                    <Input placeholder="e.g., Electronics-NYC, Pharma-LA" size="large" />
                  </Form.Item>
                  <Alert
                    message="Unique ID will be auto-generated"
                    description="No need to worry about duplicate IDs - the system creates a unique identifier for each shipment automatically."
                    type="info"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
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

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="Category"
                  >
                    <Select>
                      <Select.Option value="GeneralGoods">General Goods</Select.Option>
                      <Select.Option value="Perishable">Perishable</Select.Option>
                      <Select.Option value="Hazardous">Hazardous</Select.Option>
                      <Select.Option value="HighValue">High Value</Select.Option>
                      <Select.Option value="Pharmaceutical">Pharmaceutical</Select.Option>
                      <Select.Option value="Electronics">Electronics</Select.Option>
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="declaredValue"
                    label="Value ($)"
                  >
                    <InputNumber
                      style={{ width: '100%' }}
                      min={1}
                      formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                      parser={value => value!.replace(/\$\s?|(,*)/g, '')}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="weightKg"
                    label="Weight (kg)"
                  >
                    <InputNumber style={{ width: '100%' }} min={1} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="quantity"
                    label="Quantity"
                  >
                    <InputNumber style={{ width: '100%' }} min={1} />
                  </Form.Item>
                </Col>
              </Row>

              <Alert
                message="Advanced settings (Temperature, Humidity, Fragility, Priority, Risk) are pre-filled with recommended values"
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={loading || isSubmittingShipment} size="large">
                    Submit Shipment
                  </Button>
                  <Button onClick={handleModalClose} size="large">Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        );

      case 'inspection':
        return (
          <Modal
            title="Record Quality Inspection"
            visible={modalVisible}
            onCancel={handleModalClose}
            footer={null}
            width={500}
          >
            <Form
              form={inspectionForm}
              layout="vertical"
              onFinish={async (values) => {
                try {
                  await recordInspection({
                    shipmentId: selectedShipment?.id || '',
                    ...values,
                  });
                  message.success('Inspection recorded successfully');
                  handleModalClose();
                } catch (error) {
                  message.error('Failed to record inspection');
                }
              }}
            >
              <Form.Item
                name="qualityScore"
                label="Quality Score"
                rules={[{ required: true, message: 'Please enter quality score' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  placeholder="0-100"
                />
              </Form.Item>

              <Form.Item
                name="passed"
                label="Inspection Result"
                rules={[{ required: true, message: 'Please select result' }]}
              >
                <Select placeholder="Select result">
                  <Select.Option value={true}>Passed</Select.Option>
                  <Select.Option value={false}>Failed</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label="Inspection Notes"
              >
                <Input.TextArea rows={4} placeholder="Enter inspection notes..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={isRecordingInspection}>
                    Record Inspection
                  </Button>
                  <Button onClick={handleModalClose}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        );

      case 'customs':
        return (
          <Modal
            title="Process Customs Clearance"
            visible={modalVisible}
            onCancel={handleModalClose}
            footer={null}
            width={500}
          >
            <Form
              form={customsForm}
              layout="vertical"
              onFinish={async (values) => {
                try {
                  await processCustomsClearance({
                    shipmentId: selectedShipment?.id || '',
                    ...values,
                  });
                  message.success('Customs clearance processed');
                  handleModalClose();
                } catch (error) {
                  message.error('Failed to process customs clearance');
                }
              }}
            >
              <Form.Item
                name="complianceScore"
                label="Compliance Score"
                rules={[{ required: true, message: 'Please enter compliance score' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  min={0}
                  max={100}
                  placeholder="0-100"
                />
              </Form.Item>

              <Form.Item
                name="clearanceStatus"
                label="Clearance Status"
                rules={[{ required: true, message: 'Please select status' }]}
              >
                <Select placeholder="Select status">
                  <Select.Option value="cleared">Cleared</Select.Option>
                  <Select.Option value="pending">Pending Review</Select.Option>
                  <Select.Option value="rejected">Rejected</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={isProcessingCustomsClearance}>
                    Process Clearance
                  </Button>
                  <Button onClick={handleModalClose}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        );

      case 'checkpoint':
        return (
          <Modal
            title="Record Logistics Checkpoint"
            visible={modalVisible}
            onCancel={handleModalClose}
            footer={null}
            width={500}
          >
            <Form
              form={checkpointForm}
              layout="vertical"
              onFinish={async (values) => {
                try {
                  await recordCheckpoint({
                    shipmentId: selectedShipment?.id || '',
                    ...values,
                  });
                  message.success('Checkpoint recorded');
                  handleModalClose();
                } catch (error) {
                  message.error('Failed to record checkpoint');
                }
              }}
            >
              <Form.Item
                name="location"
                label="Current Location"
                rules={[{ required: true, message: 'Please enter location' }]}
              >
                <Input prefix={<EnvironmentOutlined />} placeholder="e.g., Port of Singapore" />
              </Form.Item>

              <Form.Item
                name="timestamp"
                label="Timestamp"
                rules={[{ required: true, message: 'Please select timestamp' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="status"
                label="Status Update"
              >
                <Input.TextArea rows={3} placeholder="Enter status update..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={isRecordingCheckpoint}>
                    Record Checkpoint
                  </Button>
                  <Button onClick={handleModalClose}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        );

      case 'claim':
        return (
          <Modal
            title="Process Insurance Claim"
            visible={modalVisible}
            onCancel={handleModalClose}
            footer={null}
            width={500}
          >
            <Form
              form={claimForm}
              layout="vertical"
              onFinish={async (values) => {
                try {
                  await processClaim({
                    shipmentId: selectedShipment?.id || '',
                    ...values,
                  });
                  message.success('Claim processed');
                  handleModalClose();
                } catch (error) {
                  message.error('Failed to process claim');
                }
              }}
            >
              <Form.Item
                name="claimAmount"
                label="Claim Amount"
                rules={[{ required: true, message: 'Please enter claim amount' }]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  prefix="$"
                  placeholder="0.00"
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                />
              </Form.Item>

              <Form.Item
                name="reason"
                label="Claim Reason"
                rules={[{ required: true, message: 'Please select reason' }]}
              >
                <Select placeholder="Select reason">
                  <Select.Option value="damage">Damage</Select.Option>
                  <Select.Option value="loss">Loss</Select.Option>
                  <Select.Option value="delay">Delay</Select.Option>
                  <Select.Option value="theft">Theft</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="description"
                label="Description"
                rules={[{ required: true, message: 'Please enter description' }]}
              >
                <Input.TextArea rows={4} placeholder="Describe the claim..." />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit" loading={isProcessingClaim}>
                    Process Claim
                  </Button>
                  <Button onClick={handleModalClose}>Cancel</Button>
                </Space>
              </Form.Item>
            </Form>
          </Modal>
        );

      default:
        return null;
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
              Please connect your wallet to access the CipheredSupply-Ledger DApp
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
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ color: '#E5E7EB', fontSize: 36, fontWeight: 600, marginBottom: 8 }}>
              Supply Chain Dashboard
            </h1>
            <p style={{ color: '#94A3B8', fontSize: 16 }}>
              Manage and track encrypted supply chain operations
            </p>
          </div>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Row gutter={[16, 16]} style={{ marginBottom: 32 }}>
            {stats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card
                  bordered={false}
                  style={{
                    background: '#0F1419',
                    border: '1px solid #1E293B',
                  }}
                >
                  <Statistic
                    title={<span style={{ color: '#94A3B8' }}>{stat.title}</span>}
                    value={stat.value}
                    valueStyle={{ color: stat.color }}
                    prefix={stat.icon}
                    suffix={
                      <span style={{ fontSize: 14, color: stat.change.startsWith('+') ? '#10B981' : '#EF4444' }}>
                        {stat.change}
                      </span>
                    }
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </motion.div>

        {/* Main Content */}
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
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              tabBarExtraContent={
                <Space>
                  <Button icon={<ReloadOutlined />}>Refresh</Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleActionClick('shipment')}
                  >
                    New Shipment
                  </Button>
                </Space>
              }
            >
              <TabPane
                tab={
                  <span>
                    <InboxOutlined />
                    Shipments
                  </span>
                }
                key="shipments"
              >
                <Table
                  columns={shipmentColumns}
                  dataSource={mockShipments}
                  pagination={{ pageSize: 10 }}
                  style={{ marginTop: 16 }}
                />
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <CheckCircleOutlined />
                    Quality Inspection
                  </span>
                }
                key="inspection"
              >
                <Empty
                  description="Select a shipment to record inspection"
                  style={{ padding: '40px 0' }}
                >
                  <Button
                    type="primary"
                    onClick={() => handleActionClick('inspection')}
                  >
                    Record Inspection
                  </Button>
                </Empty>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <GlobalOutlined />
                    Customs Clearance
                  </span>
                }
                key="customs"
              >
                <Empty
                  description="Select a shipment to process customs"
                  style={{ padding: '40px 0' }}
                >
                  <Button
                    type="primary"
                    onClick={() => handleActionClick('customs')}
                  >
                    Process Customs
                  </Button>
                </Empty>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <TruckOutlined />
                    Logistics
                  </span>
                }
                key="logistics"
              >
                <Empty
                  description="Select a shipment to track logistics"
                  style={{ padding: '40px 0' }}
                >
                  <Button
                    type="primary"
                    onClick={() => handleActionClick('checkpoint')}
                  >
                    Record Checkpoint
                  </Button>
                </Empty>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FileProtectOutlined />
                    Insurance Claims
                  </span>
                }
                key="claims"
              >
                <Empty
                  description="No insurance claims to process"
                  style={{ padding: '40px 0' }}
                >
                  <Button
                    type="primary"
                    onClick={() => handleActionClick('claim')}
                  >
                    Process Claim
                  </Button>
                </Empty>
              </TabPane>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      {/* Modals */}
      {renderModal()}
    </div>
  );
};

export default DApp;