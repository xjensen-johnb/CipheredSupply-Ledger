import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { sepolia } from 'wagmi/chains';

const projectId = import.meta.env.VITE_WALLETCONNECT_ID || '00000000000000000000000000000000';

export const config = getDefaultConfig({
  appName: 'CipheredSupply Ledger',
  projectId,
  chains: [sepolia],
  ssr: false,
});
