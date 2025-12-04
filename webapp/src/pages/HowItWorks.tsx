import React from 'react';
import { Card, Row, Col, Typography, Steps, Timeline, Space } from 'antd';
import { motion } from 'framer-motion';
import {
  UploadOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  TruckOutlined,
  FileProtectOutlined,
  ArrowRightOutlined,
  LockOutlined,
  ApiOutlined,
  CloudServerOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HowItWorks: React.FC = () => {
  const processSteps = [
    {
      title: 'Shipment Submission',
      subtitle: 'Encrypted Data Upload',
      description: 'Suppliers submit shipment details with full FHE encryption, ensuring data privacy from the start',
      icon: <UploadOutlined style={{ fontSize: 24 }} />,
      color: '#2563EB',
    },
    {
      title: 'Quality Inspection',
      subtitle: 'FHE Computation',
      description: 'Quality checks performed on encrypted data without decryption, maintaining confidentiality',
      icon: <CheckCircleOutlined style={{ fontSize: 24 }} />,
      color: '#0EA5E9',
    },
    {
      title: 'Customs Clearance',
      subtitle: 'Compliance Scoring',
      description: 'Automated compliance verification using encrypted computations for regulatory requirements',
      icon: <GlobalOutlined style={{ fontSize: 24 }} />,
      color: '#10B981',
    },
    {
      title: 'Logistics Tracking',
      subtitle: 'Checkpoint Recording',
      description: 'Real-time tracking with encrypted location updates at each checkpoint',
      icon: <TruckOutlined style={{ fontSize: 24 }} />,
      color: '#06B6D4',
    },
    {
      title: 'Insurance Claims',
      subtitle: 'Encrypted Verification',
      description: 'Process claims with privacy-preserving verification of shipment conditions',
      icon: <FileProtectOutlined style={{ fontSize: 24 }} />,
      color: '#8B5CF6',
    },
  ];

  const architectureLayers = [
    {
      title: 'Frontend Layer',
      icon: <ApiOutlined />,
      description: 'React + Ant Design interface with Web3 wallet integration',
      color: '#2563EB',
      details: ['User Interface', 'Wallet Connection', 'Transaction Signing'],
    },
    {
      title: 'Smart Contract Layer',
      icon: <CloudServerOutlined />,
      description: 'Solidity contracts deployed on Ethereum blockchain',
      color: '#0EA5E9',
      details: ['Business Logic', 'State Management', 'Event Emission'],
    },
    {
      title: 'FHE Layer',
      icon: <LockOutlined />,
      description: 'Zama FHE SDK for homomorphic encryption operations',
      color: '#10B981',
      details: ['Encryption/Decryption', 'Encrypted Computations', 'Privacy Preservation'],
    },
  ];

  const fheExplanation = [
    {
      title: 'What is FHE?',
      content: 'Fully Homomorphic Encryption (FHE) is a cryptographic technique that allows computations to be performed on encrypted data without decrypting it first. This ensures complete data privacy throughout the entire processing pipeline.',
    },
    {
      title: 'Why FHE for Supply Chain?',
      content: 'Supply chains involve multiple stakeholders who need to verify and process sensitive information. FHE enables these operations while maintaining confidentiality, preventing data leaks, and ensuring compliance with privacy regulations.',
    },
    {
      title: 'Privacy Benefits',
      content: 'With FHE, sensitive business data like pricing, quantities, and supplier details remain encrypted at all times. Only authorized parties can decrypt the final results, ensuring competitive advantages are protected.',
    },
  ];

  return (
    <div style={{ background: '#050709', minHeight: '100vh', paddingTop: 40, paddingBottom: 120 }}>
      {/* Header Section */}
      <section style={{ padding: '40px 24px 40px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
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
                marginBottom: 24,
              }}
            >
              How It Works
            </Title>
            <Paragraph
              style={{
                textAlign: 'center',
                fontSize: 18,
                color: '#94A3B8',
                maxWidth: 700,
                margin: '0 auto',
              }}
            >
              Discover how CipheredSupply-Ledger revolutionizes supply chain management
              through advanced encryption and blockchain technology
            </Paragraph>
          </motion.div>
        </div>
      </section>

      {/* Video Demo Section - Moved to Top */}
      <section style={{ padding: '20px 24px 60px', background: '#050709' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #0F1419 0%, #1A1F2A 100%)',
                border: '1px solid #2563EB33',
                borderRadius: 20,
                overflow: 'hidden',
                maxWidth: 1000,
                margin: '0 auto',
                boxShadow: '0 20px 60px rgba(37, 99, 235, 0.15)',
              }}
            >
              <div style={{ padding: '24px 24px 16px', textAlign: 'center' }}>
                <Title level={3} style={{ color: '#E5E7EB', marginBottom: 8 }}>
                  <LockOutlined style={{ marginRight: 12, color: '#2563EB' }} />
                  Live Demo: FHE-Powered Supply Chain
                </Title>
                <Paragraph style={{ color: '#94A3B8', marginBottom: 0 }}>
                  Watch how encrypted shipment data is submitted and processed on-chain without revealing sensitive information
                </Paragraph>
              </div>
              <div style={{ position: 'relative', width: '100%', padding: '0 24px 24px' }}>
                <video
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{
                    width: '100%',
                    height: 'auto',
                    borderRadius: 12,
                    background: '#000',
                    border: '1px solid #1E293B',
                  }}
                >
                  <source src="/test-demo.mp4" type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
              <div style={{
                padding: '16px 24px 24px',
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                flexWrap: 'wrap'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#10B981'
                  }} />
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>Connect Wallet</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#2563EB'
                  }} />
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>FHE Encryption</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#8B5CF6'
                  }} />
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>On-Chain Submit</Text>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: '#F59E0B'
                  }} />
                  <Text style={{ color: '#94A3B8', fontSize: 13 }}>View Shipments</Text>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Step-by-step Flow */}
      <section style={{ padding: '40px 24px', background: '#0B0F14' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title
              level={2}
              style={{
                textAlign: 'center',
                marginBottom: 64,
                color: '#E5E7EB',
                fontSize: 36,
              }}
            >
              Process Flow
            </Title>

            <Steps
              current={-1}
              direction="vertical"
              style={{ marginBottom: 48 }}
              items={processSteps.map((step, index) => ({
                title: (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        background: '#0F1419',
                        border: '1px solid #1E293B',
                        borderRadius: 12,
                        marginBottom: 24,
                      }}
                    >
                      <Row align="middle" gutter={24}>
                        <Col xs={24} sm={3}>
                          <div
                            style={{
                              width: 60,
                              height: 60,
                              borderRadius: 12,
                              background: `${step.color}15`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              margin: '0 auto',
                            }}
                          >
                            <div style={{ color: step.color }}>{step.icon}</div>
                          </div>
                        </Col>
                        <Col xs={24} sm={21}>
                          <Title level={4} style={{ color: '#E5E7EB', marginBottom: 4 }}>
                            {step.title}
                            <ArrowRightOutlined style={{ marginLeft: 12, fontSize: 16, color: step.color }} />
                            <span style={{ marginLeft: 12, color: step.color }}>
                              {step.subtitle}
                            </span>
                          </Title>
                          <Paragraph style={{ color: '#94A3B8', marginBottom: 0 }}>
                            {step.description}
                          </Paragraph>
                        </Col>
                      </Row>
                    </Card>
                  </motion.div>
                ),
                icon: null,
              }))}
            />
          </motion.div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section style={{ padding: '80px 24px', background: '#050709' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title
              level={2}
              style={{
                textAlign: 'center',
                marginBottom: 64,
                color: '#E5E7EB',
                fontSize: 36,
              }}
            >
              System Architecture
            </Title>

            <Row gutter={[24, 24]}>
              {architectureLayers.map((layer, index) => (
                <Col xs={24} md={8} key={index}>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        background: '#0F1419',
                        border: '1px solid #1E293B',
                        borderRadius: 12,
                        height: '100%',
                      }}
                    >
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 12,
                          background: `${layer.color}15`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginBottom: 24,
                        }}
                      >
                        <div style={{ color: layer.color, fontSize: 24 }}>
                          {layer.icon}
                        </div>
                      </div>

                      <Title level={4} style={{ color: '#E5E7EB', marginBottom: 12 }}>
                        {layer.title}
                      </Title>
                      <Paragraph style={{ color: '#94A3B8', marginBottom: 24 }}>
                        {layer.description}
                      </Paragraph>

                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {layer.details.map((detail, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                background: layer.color,
                                marginRight: 12,
                              }}
                            />
                            <Text style={{ color: '#94A3B8' }}>{detail}</Text>
                          </div>
                        ))}
                      </Space>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>

            {/* Connection Lines */}
            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Text style={{ color: '#94A3B8', fontSize: 16 }}>
                Layers communicate through secure APIs and blockchain transactions
              </Text>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FHE Technology Explanation */}
      <section style={{ padding: '80px 24px', background: '#0B0F14' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Title
              level={2}
              style={{
                textAlign: 'center',
                marginBottom: 64,
                color: '#E5E7EB',
                fontSize: 36,
              }}
            >
              FHE Technology
            </Title>

            <Row gutter={[24, 24]}>
              {fheExplanation.map((item, index) => (
                <Col xs={24} md={8} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        background: 'linear-gradient(135deg, #0F1419 0%, #1A1F2A 100%)',
                        border: '1px solid #1E293B',
                        borderRadius: 12,
                        height: '100%',
                      }}
                    >
                      <Title level={4} style={{ color: '#2563EB', marginBottom: 16 }}>
                        {item.title}
                      </Title>
                      <Paragraph style={{ color: '#94A3B8', marginBottom: 0 }}>
                        {item.content}
                      </Paragraph>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </div>
      </section>

    </div>
  );
};

export default HowItWorks;