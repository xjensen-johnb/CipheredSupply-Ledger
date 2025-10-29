import { ThemeConfig } from 'antd';
import { theme } from 'antd';

// Light theme configuration
export const lightTheme: ThemeConfig = {
  algorithm: theme.defaultAlgorithm,
  token: {
    colorPrimary: '#2563EB',
    colorInfo: '#2563EB',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorBgLayout: '#F7F9FC',
    colorBgContainer: '#FFFFFF',
    colorTextBase: '#0F172A',
    colorBorder: '#E5E7EB',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Card: {
      borderRadiusLG: 12,
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
    },
    Select: {
      controlHeight: 40,
    },
    Table: {
      borderRadius: 12,
    },
  },
};

// Dark theme configuration for blockchain tech style
export const darkTheme: ThemeConfig = {
  algorithm: theme.darkAlgorithm,
  token: {
    colorPrimary: '#2563EB',
    colorInfo: '#2563EB',
    colorSuccess: '#10B981',
    colorWarning: '#F59E0B',
    colorError: '#EF4444',
    colorBgBase: '#0B0F14',
    colorBgContainer: '#0F1419',
    colorBgLayout: '#050709',
    colorBgElevated: '#1A1F2A',
    colorTextBase: '#E5E7EB',
    colorBorder: '#1E293B',
    fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
    borderRadius: 8,
    fontSize: 14,
  },
  components: {
    Button: {
      controlHeight: 40,
      borderRadius: 8,
      primaryShadow: 'none',
      colorPrimaryHover: '#3B82F6',
      colorPrimaryActive: '#1D4ED8',
    },
    Card: {
      borderRadiusLG: 12,
      colorBgContainer: '#0F1419',
      colorBorderSecondary: '#1E293B',
    },
    Input: {
      controlHeight: 40,
      borderRadius: 8,
      colorBgContainer: '#1A1F2A',
      colorBorder: '#334155',
    },
    Select: {
      controlHeight: 40,
      colorBgContainer: '#1A1F2A',
      colorBorder: '#334155',
    },
    Table: {
      borderRadius: 12,
      colorBgContainer: '#0F1419',
      headerBg: '#1A1F2A',
      colorBorderSecondary: '#1E293B',
    },
    Menu: {
      colorBgContainer: '#0F1419',
      colorItemBgHover: '#1A1F2A',
      colorItemBgSelected: '#1E293B',
    },
    Layout: {
      colorBgHeader: '#0B0F14',
      colorBgBody: '#050709',
    },
    Tabs: {
      colorBgContainer: 'transparent',
      colorBorderSecondary: '#1E293B',
    },
  },
};