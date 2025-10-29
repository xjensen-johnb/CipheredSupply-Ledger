import React from 'react';
import { Button, Card, Row, Col, Typography, Space, Statistic } from 'antd';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LockOutlined,
  LinkOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  ArrowRightOutlined,
  RocketOutlined,
  FileTextOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <LockOutlined style={{ fontSize: 32 }} />,
      title: 'Fully Encrypted Data',
      description: 'End-to-end FHE encryption ensuring complete data privacy throughout the supply chain',
      color: '#2563EB',
    },
    {
      icon: <LinkOutlined style={{ fontSize: 32 }} />,
      title: 'Blockchain Transparent',
      description: 'Immutable and transparent record keeping with blockchain technology',
      color: '#0EA5E9',
    },
    {
      icon: <ThunderboltOutlined style={{ fontSize: 32 }} />,
      title: 'Real-time Processing',
      description: 'Lightning-fast encrypted computations without compromising security',
      color: '#10B981',
    },
    {
      icon: <SafetyOutlined style={{ fontSize: 32 }} />,
      title: 'Zero-Knowledge Proof',
      description: 'Verify information without revealing underlying sensitive data',
      color: '#06B6D4',
    },
  ];

  const stats = [
    { title: 'Total Shipments', value: '12,459', prefix: '', suffix: '', color: '#2563EB' },
    { title: 'Active Routes', value: '847', prefix: '', suffix: '+', color: '#0EA5E9' },
    { title: 'Cleared Customs', value: '98.7', prefix: '', suffix: '%', color: '#10B981' },
    { title: 'Claims Processed', value: '3,291', prefix: '', suffix: '', color: '#06B6D4' },
  ];

  const techStack = [
    { name: 'Zama FHE', description: 'Fully Homomorphic Encryption' },
    { name: 'Solidity', description: 'Smart Contract Development' },
    { name: 'React + Ant Design', description: 'Modern UI Framework' },
    { name: 'Sepolia Testnet', description: 'Ethereum Test Network' },
  ];

  return (
    <div style={{ background: '#050709', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 120px' }}>
        {/* Background Grid Animation */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `
              linear-gradient(rgba(37, 99, 235, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(37, 99, 235, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'grid-move 20s linear infinite',
          }}
        />

        {/* Grid animation keyframes */}
        <style>{`
          @keyframes grid-move {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
        `}</style>

        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ textAlign: 'center' }}
          >
            <Title
              level={1}
              style={{
                fontSize: 56,
                fontWeight: 700,
                color: '#E5E7EB',
                marginBottom: 24,
                letterSpacing: '-0.02em',
                lineHeight: 1.1
              }}
            >
              CipheredSupply-Ledger
              <br />
              <span style={{ color: '#2563EB' }}>Privacy-Preserving Supply Chain</span>
            </Title>

            <Paragraph
              style={{
                fontSize: 20,
                color: '#94A3B8',
                marginBottom: 48,
                maxWidth: 700,
                margin: '0 auto 48px'
              }}
            >
              Revolutionizing supply chain management with Fully Homomorphic Encryption (FHE) technology.
              Secure, transparent, and efficient logistics powered by blockchain.
            </Paragraph>

            <Space size={16}>
              <Button
                type="primary"
                size="large"
                icon={<RocketOutlined />}
                onClick={() => navigate('/dapp')}
                style={{
                  height: 48,
                  padding: '0 32px',
                  fontSize: 16,
                  fontWeight: 600,
                }}
              >
                Launch DApp
              </Button>
              <Button
                size="large"
                icon={<FileTextOutlined />}
                onClick={() => navigate('/docs')}
                style={{
                  height: 48,
                  padding: '0 32px',
                  fontSize: 16,
                  fontWeight: 600,
                  background: 'transparent',
                  color: '#E5E7EB',
                  borderColor: '#334155',
                }}
              >
                View Docs
              </Button>
            </Space>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
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
                marginBottom: 16,
                color: '#E5E7EB',
                fontSize: 40,
                fontWeight: 600,
              }}
            >
              Core Features
            </Title>
            <Paragraph
              style={{
                textAlign: 'center',
                marginBottom: 64,
                color: '#94A3B8',
                fontSize: 18,
              }}
            >
              Built with cutting-edge technology for maximum security and efficiency
            </Paragraph>

            <Row gutter={[24, 24]}>
              {features.map((feature, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
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
                        transition: 'all 0.3s',
                      }}
                      hoverable
                      className="feature-card"
                    >
                      <div style={{
                        width: 64,
                        height: 64,
                        borderRadius: 12,
                        background: `${feature.color}15`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 24,
                      }}>
                        <div style={{ color: feature.color }}>
                          {feature.icon}
                        </div>
                      </div>

                      <Title level={4} style={{ color: '#E5E7EB', marginBottom: 12 }}>
                        {feature.title}
                      </Title>
                      <Paragraph style={{ color: '#94A3B8', marginBottom: 0 }}>
                        {feature.description}
                      </Paragraph>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </div>
      </section>

      {/* Statistics Section */}
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
                fontSize: 40,
                fontWeight: 600,
              }}
            >
              Platform Statistics
            </Title>

            <Row gutter={[24, 24]}>
              {stats.map((stat, index) => (
                <Col xs={12} lg={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        background: '#0F1419',
                        border: '1px solid #1E293B',
                        borderRadius: 12,
                        textAlign: 'center',
                      }}
                    >
                      <Statistic
                        title={<span style={{ color: '#94A3B8', fontSize: 14 }}>{stat.title}</span>}
                        value={stat.value}
                        valueStyle={{ color: stat.color, fontSize: 32, fontWeight: 700 }}
                        prefix={stat.prefix}
                        suffix={stat.suffix}
                      />
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section style={{ padding: '80px 24px 120px', background: '#0B0F14' }}>
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
                fontSize: 40,
                fontWeight: 600,
              }}
            >
              Technology Stack
            </Title>

            <Row gutter={[24, 24]}>
              {techStack.map((tech, index) => (
                <Col xs={24} sm={12} lg={6} key={index}>
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <div
                      style={{
                        background: '#0F1419',
                        border: '1px solid #1E293B',
                        borderRadius: 12,
                        padding: 24,
                        textAlign: 'center',
                        transition: 'all 0.3s',
                        cursor: 'pointer',
                      }}
                      className="tech-card"
                    >
                      <Title level={4} style={{ color: '#2563EB', marginBottom: 8 }}>
                        {tech.name}
                      </Title>
                      <Paragraph style={{ color: '#94A3B8', marginBottom: 0 }}>
                        {tech.description}
                      </Paragraph>
                    </div>
                  </motion.div>
                </Col>
              ))}
            </Row>
          </motion.div>
        </div>
      </section>

      {/* Add hover effects */}
      <style>{`
        .feature-card:hover {
          transform: translateY(-4px);
          border-color: #2563EB !important;
        }
        .tech-card:hover {
          transform: translateY(-4px);
          border-color: #2563EB !important;
          background: #1A1F2A !important;
        }
      `}</style>
    </div>
  );
};

export default Landing;