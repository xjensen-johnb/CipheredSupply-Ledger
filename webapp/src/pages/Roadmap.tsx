import React from 'react';
import { Timeline, Card, Typography, Tag, Progress, Row, Col, Space, Badge, Avatar } from 'antd';
import { motion } from 'framer-motion';
import {
  CheckCircleOutlined,
  SyncOutlined,
  ClockCircleOutlined,
  RocketOutlined,
  CodeOutlined,
  CloudServerOutlined,
  GlobalOutlined,
  LinkOutlined,
  TrophyOutlined,
  StarOutlined,
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const Roadmap: React.FC = () => {
  const roadmapData = [
    {
      phase: 'Phase 1',
      title: 'Foundation & Development',
      quarter: 'Oct-Nov 2025',
      status: 'current',
      progress: 75,
      color: '#2563EB',
      icon: <CodeOutlined />,
      items: [
        'Smart contract architecture with FHE',
        'Sepolia testnet deployment',
        'Frontend DApp development',
        'Performance optimization (15s encryption)',
      ],
    },
    {
      phase: 'Phase 2',
      title: 'Security & Testing',
      quarter: 'Dec 2025',
      status: 'upcoming',
      progress: 0,
      color: '#94A3B8',
      icon: <CloudServerOutlined />,
      items: [
        'Comprehensive security audit',
        'Smart contract optimization',
        'Community testing program',
        'Bug fixes and improvements',
      ],
    },
    {
      phase: 'Phase 3',
      title: 'Mainnet Preparation',
      quarter: 'Jan 2026',
      status: 'upcoming',
      progress: 0,
      color: '#94A3B8',
      icon: <RocketOutlined />,
      items: [
        'Final audit completion',
        'Mainnet deployment preparation',
        'Partner onboarding program',
        'Marketing campaign launch',
      ],
    },
    {
      phase: 'Phase 4',
      title: 'Mainnet Launch',
      quarter: 'Feb-Mar 2026',
      status: 'upcoming',
      progress: 0,
      color: '#94A3B8',
      icon: <GlobalOutlined />,
      items: [
        'Ethereum mainnet deployment',
        'Production DApp launch',
        'Enterprise partnerships activation',
        'Community growth initiatives',
      ],
    },
    {
      phase: 'Phase 5',
      title: 'Multi-chain Expansion',
      quarter: 'Q2 2026',
      status: 'upcoming',
      progress: 0,
      color: '#94A3B8',
      icon: <LinkOutlined />,
      items: [
        'Polygon and Arbitrum integration',
        'Cross-chain bridge development',
        'Enhanced scalability features',
        'Global supply chain partnerships',
      ],
    },
  ];

  const upcomingFeatures = [
    {
      title: 'AI-Powered Analytics',
      description: 'Machine learning for supply chain optimization',
      icon: '🤖',
    },
    {
      title: 'IoT Device Integration',
      description: 'Real-time sensor data from shipping containers',
      icon: '📡',
    },
    {
      title: 'Carbon Footprint Tracking',
      description: 'Sustainability metrics and reporting',
      icon: '🌱',
    },
    {
      title: 'Decentralized Insurance',
      description: 'Automated claim processing with smart contracts',
      icon: '🛡️',
    },
  ];

  const milestones = [
    { number: '10K+', label: 'Shipments Target', icon: <TrophyOutlined /> },
    { number: '100+', label: 'Partner Goal', icon: <StarOutlined /> },
    { number: '99.9%', label: 'Uptime Target', icon: <CheckCircleOutlined /> },
    { number: '$100M+', label: 'Value Goal', icon: <GlobalOutlined /> },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleOutlined style={{ color: '#10B981' }} />;
      case 'current':
        return <SyncOutlined spin style={{ color: '#2563EB' }} />;
      case 'upcoming':
        return <ClockCircleOutlined style={{ color: '#94A3B8' }} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ background: '#050709', minHeight: '100vh', paddingTop: 40, paddingBottom: 120 }}>
      {/* Header Section */}
      <section style={{ padding: '40px 24px 80px' }}>
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
              Project Roadmap
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
              Our journey towards revolutionizing supply chain management with
              privacy-preserving technology
            </Paragraph>
          </motion.div>
        </div>
      </section>

      {/* Current Progress Overview */}
      <section style={{ padding: '0 24px 80px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Card
              bordered={false}
              style={{
                background: 'linear-gradient(135deg, #0F1419 0%, #1A1F2A 100%)',
                border: '1px solid #1E293B',
                borderRadius: 16,
                padding: '32px',
                marginBottom: 48,
              }}
            >
              <Row align="middle" justify="space-between">
                <Col xs={24} md={12}>
                  <Title level={3} style={{ color: '#E5E7EB', marginBottom: 16 }}>
                    Overall Progress
                  </Title>
                  <Progress
                    percent={15}
                    strokeColor={{
                      '0%': '#2563EB',
                      '100%': '#0EA5E9',
                    }}
                    strokeWidth={12}
                    style={{ marginBottom: 24 }}
                  />
                  <Space size={24}>
                    <div>
                      <Text style={{ color: '#94A3B8' }}>Completed</Text>
                      <Title level={4} style={{ color: '#10B981', marginTop: 4 }}>
                        0 Phases
                      </Title>
                    </div>
                    <div>
                      <Text style={{ color: '#94A3B8' }}>Current</Text>
                      <Title level={4} style={{ color: '#2563EB', marginTop: 4 }}>
                        Oct 2025
                      </Title>
                    </div>
                    <div>
                      <Text style={{ color: '#94A3B8' }}>Upcoming</Text>
                      <Title level={4} style={{ color: '#E5E7EB', marginTop: 4 }}>
                        4 Phases
                      </Title>
                    </div>
                  </Space>
                </Col>
                <Col xs={24} md={10}>
                  <div style={{ textAlign: 'center', marginTop: 24 }}>
                    <Badge.Ribbon text="CURRENT" color="#2563EB">
                      <Card
                        bordered={false}
                        style={{
                          background: '#0B0F14',
                          border: '1px solid #2563EB',
                        }}
                      >
                        <CodeOutlined style={{ fontSize: 48, color: '#2563EB', marginBottom: 16 }} />
                        <Title level={4} style={{ color: '#E5E7EB', marginBottom: 8 }}>
                          Foundation & Development
                        </Title>
                        <Text style={{ color: '#94A3B8' }}>Oct-Nov 2025 - 75% Complete</Text>
                      </Card>
                    </Badge.Ribbon>
                  </div>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section */}
      <section style={{ padding: '0 24px 80px' }}>
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
              Development Timeline
            </Title>

            <Timeline mode="alternate">
              {roadmapData.map((phase, index) => (
                <Timeline.Item
                  key={index}
                  dot={getStatusIcon(phase.status)}
                  color={phase.status === 'completed' ? 'green' : phase.status === 'current' ? 'blue' : 'gray'}
                >
                  <motion.div
                    initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Card
                      bordered={false}
                      style={{
                        background: '#0F1419',
                        border: `1px solid ${phase.status === 'current' ? '#2563EB' : '#1E293B'}`,
                        borderRadius: 12,
                      }}
                    >
                      <div style={{ marginBottom: 16 }}>
                        <Space align="center">
                          <Avatar
                            style={{
                              backgroundColor: phase.color + '20',
                              color: phase.color,
                            }}
                            icon={phase.icon}
                            size={40}
                          />
                          <div>
                            <Text style={{ color: '#94A3B8', fontSize: 12 }}>
                              {phase.phase} • {phase.quarter}
                            </Text>
                            <Title level={4} style={{ color: '#E5E7EB', marginBottom: 0 }}>
                              {phase.title}
                            </Title>
                          </div>
                        </Space>
                      </div>

                      <Progress
                        percent={phase.progress}
                        strokeColor={phase.color}
                        strokeWidth={6}
                        style={{ marginBottom: 16 }}
                      />

                      <Space direction="vertical" size={8} style={{ width: '100%' }}>
                        {phase.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', alignItems: 'flex-start' }}>
                            {phase.status === 'completed' ? (
                              <CheckCircleOutlined style={{ color: '#10B981', marginRight: 8, marginTop: 2 }} />
                            ) : phase.status === 'current' ? (
                              <SyncOutlined style={{ color: '#2563EB', marginRight: 8, marginTop: 2 }} />
                            ) : (
                              <ClockCircleOutlined style={{ color: '#94A3B8', marginRight: 8, marginTop: 2 }} />
                            )}
                            <Text style={{ color: '#94A3B8', flex: 1 }}>{item}</Text>
                          </div>
                        ))}
                      </Space>

                      {phase.status === 'current' && (
                        <Tag color="blue" style={{ marginTop: 16 }}>
                          IN PROGRESS
                        </Tag>
                      )}
                      {phase.status === 'completed' && (
                        <Tag color="green" style={{ marginTop: 16 }}>
                          COMPLETED
                        </Tag>
                      )}
                    </Card>
                  </motion.div>
                </Timeline.Item>
              ))}
            </Timeline>
          </motion.div>
        </div>
      </section>

      {/* Upcoming Features */}
      <section style={{ padding: '0 24px 80px', background: '#0B0F14' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '80px 0' }}>
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
              Future Features
            </Title>

            <Row gutter={[24, 24]}>
              {upcomingFeatures.map((feature, index) => (
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
                        textAlign: 'center',
                      }}
                      hoverable
                    >
                      <div style={{ fontSize: 48, marginBottom: 16 }}>{feature.icon}</div>
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

      {/* Milestones */}
      <section style={{ padding: '80px 24px' }}>
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
              Target Milestones
            </Title>

            <Row gutter={[24, 24]}>
              {milestones.map((milestone, index) => (
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
                        background: 'linear-gradient(135deg, #0F1419 0%, #1A1F2A 100%)',
                        border: '1px solid #1E293B',
                        borderRadius: 12,
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 24, color: '#2563EB', marginBottom: 16 }}>
                        {milestone.icon}
                      </div>
                      <Title level={2} style={{ color: '#2563EB', marginBottom: 8 }}>
                        {milestone.number}
                      </Title>
                      <Text style={{ color: '#94A3B8' }}>{milestone.label}</Text>
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

export default Roadmap;