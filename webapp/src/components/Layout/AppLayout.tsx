import React from 'react';
import { Layout, Menu, Button, Space } from 'antd';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  HomeOutlined,
  BookOutlined,
  FileTextOutlined,
  AppstoreOutlined,
  RocketOutlined,
  MenuOutlined,
} from '@ant-design/icons';
import { motion } from 'framer-motion';

const { Header, Content } = Layout;

const AppLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Home',
      path: '/',
    },
    {
      key: '/how-it-works',
      icon: <BookOutlined />,
      label: 'How It Works',
      path: '/how-it-works',
    },
    {
      key: '/docs',
      icon: <FileTextOutlined />,
      label: 'Docs',
      path: '/docs',
    },
    {
      key: '/dapp',
      icon: <AppstoreOutlined />,
      label: 'DApp',
      path: '/dapp',
    },
    {
      key: '/roadmap',
      icon: <RocketOutlined />,
      label: 'Roadmap',
      path: '/roadmap',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
    setMobileMenuOpen(false);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#050709' }}>
      <Header
        style={{
          position: 'fixed',
          top: 0,
          zIndex: 100,
          width: '100%',
          height: 64,
          padding: '0 24px',
          background: 'rgba(11, 15, 20, 0.95)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid #1E293B',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Logo and Project Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{
                width: 32,
                height: 32,
                background: 'linear-gradient(135deg, #2563EB, #0EA5E9)',
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <span style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>C</span>
            </motion.div>
            <span style={{
              color: '#E5E7EB',
              fontSize: 18,
              fontWeight: 600,
              letterSpacing: '-0.02em'
            }}>
              CipheredSupply-Ledger
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex" style={{ flex: 1, marginLeft: 48 }}>
          <Menu
            mode="horizontal"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              border: 'none',
              flex: 1,
              minWidth: 0,
              justifyContent: 'center'
            }}
            theme="dark"
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
            }))}
          />
        </div>

        {/* Wallet Connection */}
        <Space>
          <div className="hidden md:block">
            <ConnectButton
              accountStatus={{
                smallScreen: 'avatar',
                largeScreen: 'full',
              }}
              showBalance={{
                smallScreen: false,
                largeScreen: true,
              }}
            />
          </div>

          {/* Mobile Menu Button */}
          <Button
            className="md:hidden"
            type="text"
            icon={<MenuOutlined />}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{ color: '#E5E7EB' }}
          />
        </Space>
      </Header>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          style={{
            position: 'fixed',
            top: 64,
            left: 0,
            right: 0,
            background: 'rgba(11, 15, 20, 0.98)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid #1E293B',
            zIndex: 99,
            padding: '16px',
          }}
          className="md:hidden"
        >
          <Menu
            mode="vertical"
            selectedKeys={[location.pathname]}
            onClick={handleMenuClick}
            style={{
              background: 'transparent',
              border: 'none',
            }}
            theme="dark"
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
            }))}
          />
          <div style={{ marginTop: 16 }}>
            <ConnectButton
              accountStatus="avatar"
              showBalance={false}
            />
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <Content
        style={{
          marginTop: 64,
          minHeight: 'calc(100vh - 64px)',
          background: '#050709',
        }}
      >
        <Outlet />
      </Content>
    </Layout>
  );
};

export default AppLayout;