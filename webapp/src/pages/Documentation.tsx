import React, { useState } from 'react';
import { Layout, Menu, Typography, Card, Tag, Space, Divider, Alert, Tabs, Table } from 'antd';
import { motion } from 'framer-motion';
import {
  BookOutlined,
  ApiOutlined,
  CodeOutlined,
  RocketOutlined,
  SettingOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  CopyOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const { Sider, Content } = Layout;
const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

const Documentation: React.FC = () => {
  const [selectedKey, setSelectedKey] = useState('getting-started');

  const menuItems = [
    {
      key: 'getting-started',
      icon: <RocketOutlined />,
      label: 'Getting Started',
    },
    {
      key: 'smart-contracts',
      icon: <ApiOutlined />,
      label: 'Smart Contract API',
    },
    {
      key: 'frontend',
      icon: <CodeOutlined />,
      label: 'Frontend Integration',
    },
    {
      key: 'fhe-sdk',
      icon: <SafetyOutlined />,
      label: 'FHE Encryption Guide',
    },
    {
      key: 'best-practices',
      icon: <BookOutlined />,
      label: 'Best Practices',
    },
  ];

  // Smart contract functions data
  const contractFunctions: ColumnsType<any> = [
    {
      title: 'Function',
      dataIndex: 'function',
      key: 'function',
      render: (text) => <Text code style={{ color: '#2563EB' }}>{text}</Text>,
    },
    {
      title: 'Parameters',
      dataIndex: 'parameters',
      key: 'parameters',
      render: (params) => (
        <Space direction="vertical" size={4}>
          {params.map((param: string, idx: number) => (
            <Text key={idx} style={{ color: '#94A3B8', fontSize: 13 }}>{param}</Text>
          ))}
        </Space>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text style={{ color: '#E5E7EB' }}>{text}</Text>,
    },
    {
      title: 'Access',
      dataIndex: 'access',
      key: 'access',
      render: (access) => (
        <Tag color={access === 'Public' ? 'blue' : 'orange'}>{access}</Tag>
      ),
    },
  ];

  const functionsData = [
    {
      key: '1',
      function: 'submitShipment',
      parameters: ['bytes encryptedData', 'uint256 value', 'uint8 category'],
      description: 'Submit a new encrypted shipment to the ledger',
      access: 'Public',
    },
    {
      key: '2',
      function: 'recordInspection',
      parameters: ['uint256 shipmentId', 'bytes encryptedScore', 'bool passed'],
      description: 'Record quality inspection results',
      access: 'Inspector',
    },
    {
      key: '3',
      function: 'processCustomsClearance',
      parameters: ['uint256 shipmentId', 'bytes encryptedCompliance'],
      description: 'Process customs clearance with compliance score',
      access: 'Customs',
    },
    {
      key: '4',
      function: 'recordCheckpoint',
      parameters: ['uint256 shipmentId', 'bytes encryptedLocation', 'uint256 timestamp'],
      description: 'Record logistics checkpoint',
      access: 'Logistics',
    },
    {
      key: '5',
      function: 'processClaim',
      parameters: ['uint256 shipmentId', 'bytes encryptedClaim', 'uint256 amount'],
      description: 'Process insurance claim for shipment',
      access: 'Public',
    },
  ];

  const renderContent = () => {
    switch (selectedKey) {
      case 'getting-started':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Title level={2} style={{ color: '#E5E7EB', marginBottom: 24 }}>
              Getting Started
            </Title>

            <Alert
              message="Prerequisites"
              description="Make sure you have Node.js 18+, npm/yarn, and MetaMask wallet installed"
              type="info"
              showIcon
              style={{ marginBottom: 32 }}
            />

            <Card
              bordered={false}
              style={{
                background: '#0F1419',
                border: '1px solid #1E293B',
                marginBottom: 24,
              }}
            >
              <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                1. Clone the Repository
              </Title>
              <pre style={{
                background: '#1A1F2A',
                padding: 16,
                borderRadius: 8,
                color: '#E5E7EB',
                overflow: 'auto',
              }}>
                {`git clone https://github.com/your-org/cipheredsupply-ledger.git
cd cipheredsupply-ledger/webapp
npm install`}
              </pre>
            </Card>

            <Card
              bordered={false}
              style={{
                background: '#0F1419',
                border: '1px solid #1E293B',
                marginBottom: 24,
              }}
            >
              <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                2. Configure Environment
              </Title>
              <pre style={{
                background: '#1A1F2A',
                padding: 16,
                borderRadius: 8,
                color: '#E5E7EB',
                overflow: 'auto',
              }}>
                {`# .env
VITE_CONTRACT_ADDRESS=0xAe15D0e996a1556BAE97C9D696318c978A86436E
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
VITE_CHAIN_ID=11155111`}
              </pre>
            </Card>

            <Card
              bordered={false}
              style={{
                background: '#0F1419',
                border: '1px solid #1E293B',
                marginBottom: 24,
              }}
            >
              <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                3. Run Development Server
              </Title>
              <pre style={{
                background: '#1A1F2A',
                padding: 16,
                borderRadius: 8,
                color: '#E5E7EB',
                overflow: 'auto',
              }}>
                {`npm run dev
# Application will be available at http://localhost:5173`}
              </pre>
            </Card>

            <Card
              bordered={false}
              style={{
                background: '#0F1419',
                border: '1px solid #1E293B',
              }}
            >
              <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                4. Connect Wallet
              </Title>
              <Paragraph style={{ color: '#94A3B8' }}>
                Connect your MetaMask wallet to Sepolia testnet and ensure you have test ETH for transactions.
                You can get test ETH from the Sepolia faucet.
              </Paragraph>
            </Card>
          </motion.div>
        );

      case 'smart-contracts':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Title level={2} style={{ color: '#E5E7EB', marginBottom: 24 }}>
              Smart Contract API
            </Title>

            <Alert
              message="Contract Address"
              description="Deployed on Sepolia: 0xAe15D0e996a1556BAE97C9D696318c978A86436E"
              type="success"
              showIcon
              style={{ marginBottom: 32 }}
            />

            <Title level={3} style={{ color: '#E5E7EB', marginBottom: 24 }}>
              Core Functions
            </Title>

            <Table
              columns={contractFunctions}
              dataSource={functionsData}
              pagination={false}
              style={{ marginBottom: 32 }}
            />

            <Title level={3} style={{ color: '#E5E7EB', marginBottom: 16 }}>
              Events
            </Title>

            <Card
              bordered={false}
              style={{
                background: '#0F1419',
                border: '1px solid #1E293B',
              }}
            >
              <pre style={{
                background: '#1A1F2A',
                padding: 16,
                borderRadius: 8,
                color: '#E5E7EB',
                overflow: 'auto',
              }}>
                {`event ShipmentSubmitted(uint256 indexed shipmentId, address indexed sender);
event InspectionRecorded(uint256 indexed shipmentId, bool passed);
event CustomsCleared(uint256 indexed shipmentId, uint256 complianceScore);
event CheckpointRecorded(uint256 indexed shipmentId, uint256 checkpointId);
event ClaimProcessed(uint256 indexed shipmentId, uint256 amount, bool approved);`}
              </pre>
            </Card>
          </motion.div>
        );

      case 'frontend':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Title level={2} style={{ color: '#E5E7EB', marginBottom: 24 }}>
              Frontend Integration
            </Title>

            <Tabs defaultActiveKey="1" style={{ marginBottom: 32 }}>
              <TabPane tab="React Setup" key="1">
                <Card
                  bordered={false}
                  style={{
                    background: '#0F1419',
                    border: '1px solid #1E293B',
                  }}
                >
                  <pre style={{
                    background: '#1A1F2A',
                    padding: 16,
                    borderRadius: 8,
                    color: '#E5E7EB',
                    overflow: 'auto',
                  }}>
                    {`import { useContract } from '@/hooks/useSupplyLedgerContract';

function ShipmentForm() {
  const { submitShipment, isLoading } = useContract();

  const handleSubmit = async (data) => {
    const encrypted = await encryptData(data);
    await submitShipment({
      encryptedData: encrypted,
      value: data.value,
      category: data.category
    });
  };

  return (
    // Your form UI
  );
}`}
                  </pre>
                </Card>
              </TabPane>

              <TabPane tab="Web3 Connection" key="2">
                <Card
                  bordered={false}
                  style={{
                    background: '#0F1419',
                    border: '1px solid #1E293B',
                  }}
                >
                  <pre style={{
                    background: '#1A1F2A',
                    padding: 16,
                    borderRadius: 8,
                    color: '#E5E7EB',
                    overflow: 'auto',
                  }}>
                    {`import { WagmiConfig, createConfig } from 'wagmi';
import { RainbowKitProvider } from '@rainbow-me/rainbowkit';

const config = createConfig({
  chains: [sepolia],
  connectors: [
    injectedConnector(),
    walletConnectConnector(),
  ],
});

function App() {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider>
        <YourApp />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}`}
                  </pre>
                </Card>
              </TabPane>

              <TabPane tab="State Management" key="3">
                <Card
                  bordered={false}
                  style={{
                    background: '#0F1419',
                    border: '1px solid #1E293B',
                  }}
                >
                  <pre style={{
                    background: '#1A1F2A',
                    padding: 16,
                    borderRadius: 8,
                    color: '#E5E7EB',
                    overflow: 'auto',
                  }}>
                    {`import { useQuery, useMutation } from '@tanstack/react-query';

// Fetch shipments
const { data: shipments } = useQuery({
  queryKey: ['shipments'],
  queryFn: fetchShipments,
});

// Submit new shipment
const mutation = useMutation({
  mutationFn: submitShipment,
  onSuccess: () => {
    queryClient.invalidateQueries(['shipments']);
  },
});`}
                  </pre>
                </Card>
              </TabPane>
            </Tabs>
          </motion.div>
        );

      case 'fhe-sdk':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Title level={2} style={{ color: '#E5E7EB', marginBottom: 24 }}>
              FHE SDK Usage
            </Title>

            <Alert
              message="Zama FHE Integration"
              description="Using fhEVM for privacy-preserving computations on encrypted data"
              type="info"
              showIcon
              style={{ marginBottom: 32 }}
            />

            <Card
              bordered={false}
              style={{
                background: '#0F1419',
                border: '1px solid #1E293B',
                marginBottom: 24,
              }}
            >
              <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                Initialize FHE Instance
              </Title>
              <pre style={{
                background: '#1A1F2A',
                padding: 16,
                borderRadius: 8,
                color: '#E5E7EB',
                overflow: 'auto',
              }}>
                {`import { initFhevm, createInstance } from 'fhevmjs';

// Initialize the FHE instance
const initializeFhe = async () => {
  await initFhevm();
  const instance = await createInstance({
    networkUrl: 'https://sepolia.infura.io/v3/YOUR_KEY',
    gatewayUrl: 'https://gateway.zama.ai',
  });
  return instance;
};`}
              </pre>
            </Card>

            <Card
              bordered={false}
              style={{
                background: '#0F1419',
                border: '1px solid #1E293B',
                marginBottom: 24,
              }}
            >
              <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                Encrypt Data
              </Title>
              <pre style={{
                background: '#1A1F2A',
                padding: 16,
                borderRadius: 8,
                color: '#E5E7EB',
                overflow: 'auto',
              }}>
                {`// Encrypt shipment data
const encryptShipmentData = async (data, publicKey) => {
  const encrypted = await instance.encrypt32(data.value);
  const encryptedLocation = await instance.encryptAddress(data.location);

  return {
    value: encrypted,
    location: encryptedLocation,
    timestamp: Date.now()
  };
};`}
              </pre>
            </Card>

            <Card
              bordered={false}
              style={{
                background: '#0F1419',
                border: '1px solid #1E293B',
              }}
            >
              <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                Perform Encrypted Computations
              </Title>
              <pre style={{
                background: '#1A1F2A',
                padding: 16,
                borderRadius: 8,
                color: '#E5E7EB',
                overflow: 'auto',
              }}>
                {`// Smart contract side - encrypted computation
function calculateInsurance(
  euint32 encryptedValue,
  euint8 riskScore
) private view returns (euint32) {
  // Computation on encrypted values
  euint32 premium = FHE.mul(encryptedValue, riskScore);
  euint32 deductible = FHE.div(premium, 10);

  return FHE.add(premium, deductible);
}`}
              </pre>
            </Card>
          </motion.div>
        );

      case 'deployment':
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Title level={2} style={{ color: '#E5E7EB', marginBottom: 24 }}>
              Deployment Guide
            </Title>

            <Space direction="vertical" size={24} style={{ width: '100%' }}>
              <Card
                bordered={false}
                style={{
                  background: '#0F1419',
                  border: '1px solid #1E293B',
                }}
              >
                <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                  <ThunderboltOutlined style={{ marginRight: 8 }} />
                  Quick Deploy to Vercel
                </Title>
                <pre style={{
                  background: '#1A1F2A',
                  padding: 16,
                  borderRadius: 8,
                  color: '#E5E7EB',
                  overflow: 'auto',
                }}>
                  {`# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables in Vercel dashboard`}
                </pre>
              </Card>

              <Card
                bordered={false}
                style={{
                  background: '#0F1419',
                  border: '1px solid #1E293B',
                }}
              >
                <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                  <SettingOutlined style={{ marginRight: 8 }} />
                  Docker Deployment
                </Title>
                <pre style={{
                  background: '#1A1F2A',
                  padding: 16,
                  borderRadius: 8,
                  color: '#E5E7EB',
                  overflow: 'auto',
                }}>
                  {`# Build Docker image
docker build -t cipheredsupply-ledger .

# Run container
docker run -p 3000:3000 \\
  -e VITE_CONTRACT_ADDRESS=0xAe15... \\
  -e VITE_RPC_URL=https://sepolia... \\
  cipheredsupply-ledger`}
                </pre>
              </Card>

              <Card
                bordered={false}
                style={{
                  background: '#0F1419',
                  border: '1px solid #1E293B',
                }}
              >
                <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                  <FileTextOutlined style={{ marginRight: 8 }} />
                  Smart Contract Deployment
                </Title>
                <pre style={{
                  background: '#1A1F2A',
                  padding: 16,
                  borderRadius: 8,
                  color: '#E5E7EB',
                  overflow: 'auto',
                }}>
                  {`# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Verify contract
npx hardhat verify --network sepolia DEPLOYED_ADDRESS`}
                </pre>
              </Card>
            </Space>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ background: '#050709', minHeight: '100vh', paddingTop: 40 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 24px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Title
            level={1}
            style={{
              textAlign: 'center',
              fontSize: 48,
              fontWeight: 700,
              color: '#E5E7EB',
              marginBottom: 48,
            }}
          >
            Documentation
          </Title>
        </motion.div>

        <Layout style={{ background: 'transparent' }}>
          <Sider
            width={280}
            style={{
              background: '#0F1419',
              borderRadius: 12,
              border: '1px solid #1E293B',
              marginRight: 24,
              height: 'fit-content',
              position: 'sticky',
              top: 104,
            }}
          >
            <Menu
              mode="vertical"
              selectedKeys={[selectedKey]}
              onClick={({ key }) => setSelectedKey(key)}
              style={{
                background: 'transparent',
                border: 'none',
                padding: 8,
              }}
              items={menuItems}
            />
          </Sider>

          <Content style={{ minHeight: 600 }}>
            {renderContent()}
          </Content>
        </Layout>
      </div>
    </div>
  );
};

export default Documentation;