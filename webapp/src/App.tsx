import React, { useEffect } from 'react';
import { ConfigProvider } from 'antd';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { WagmiProvider } from 'wagmi';
import { RainbowKitProvider, darkTheme as rainbowDarkTheme } from '@rainbow-me/rainbowkit';
import { config } from './config/wagmi';
import '@rainbow-me/rainbowkit/styles.css';
import { darkTheme } from './config/theme';

// Layout
import AppLayout from './components/Layout/AppLayout';

// Pages
import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import Documentation from './pages/Documentation';
import DApp from './pages/DApp';
import SimplifiedDApp from './pages/SimplifiedDApp';
import MyShipments from './pages/MyShipments';
import Roadmap from './pages/Roadmap';
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Apply dark background to body
    document.body.style.background = '#050709';
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={rainbowDarkTheme({
          accentColor: '#2563EB',
          accentColorForeground: 'white',
          borderRadius: 'medium',
        })}>
          <ConfigProvider theme={darkTheme}>
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<AppLayout />}>
                  <Route index element={<Landing />} />
                  <Route path="how-it-works" element={<HowItWorks />} />
                  <Route path="docs" element={<Documentation />} />
                  <Route path="dapp" element={<SimplifiedDApp />} />
                  <Route path="simplified" element={<SimplifiedDApp />} />
                  <Route path="my-shipments" element={<MyShipments />} />
                  <Route path="roadmap" element={<Roadmap />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ConfigProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
