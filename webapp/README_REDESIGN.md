# CipheredSupply-Ledger - Complete Website Redesign

## Overview
Complete redesign of the CipheredSupply-Ledger DApp with a professional blockchain tech style using Ant Design 5.0 and React.

## Contract Address
**Sepolia Testnet**: `0xAe15D0e996a1556BAE97C9D696318c978A86436E`

## Features
- **Landing Page**: Hero section with tech grid animation, features, stats, and tech stack
- **How It Works**: Step-by-step process flow, system architecture, FHE technology explanation
- **Documentation**: Complete API reference, getting started guide, deployment instructions
- **DApp**: Redesigned dashboard with shipment management, quality inspection, customs clearance, logistics tracking, and insurance claims
- **Roadmap**: Interactive timeline with project phases and milestones

## Design System
- **Primary Color**: Blue (#2563EB)
- **Background**: Dark slate (#050709, #0B0F14, #0F1419)
- **Text Colors**: Light gray (#E5E7EB primary, #94A3B8 secondary)
- **No gradients, no purple colors, no glassmorphism**
- **Clean blockchain tech aesthetic**

## Tech Stack
- React 18 with TypeScript
- Ant Design 5.0 with custom dark theme
- React Router for navigation
- RainbowKit for wallet connection
- Wagmi for blockchain interaction
- Framer Motion for animations
- Vite for build tooling

## Installation & Setup

### 1. Install Dependencies
```bash
cd /Users/songsu/Desktop/zama/CipheredSupply-Ledger/webapp
npm install
```

### 2. Environment Configuration
Create a `.env` file (already exists with basic config):
```env
VITE_CONTRACT_ADDRESS=0xAe15D0e996a1556BAE97C9D696318c978A86436E
VITE_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
VITE_CHAIN_ID=11155111

# Optional: For Privy Integration
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### 3. Run Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

## Project Structure
```
src/
├── pages/
│   ├── Landing.tsx          # Home page with hero, features, stats
│   ├── HowItWorks.tsx       # Process flow and architecture
│   ├── Documentation.tsx    # API docs and guides
│   ├── DApp.tsx            # Main DApp interface
│   └── Roadmap.tsx         # Project roadmap timeline
├── components/
│   ├── Layout/
│   │   └── AppLayout.tsx   # Main navigation layout
│   └── WalletConnect/
│       └── PrivyWalletButton.tsx  # Custom wallet button
├── config/
│   ├── theme.ts            # Ant Design theme configuration
│   ├── wagmi.ts            # Wagmi/Web3 configuration
│   └── privy.ts            # Privy SDK configuration
└── styles/
    └── antd-overrides.css  # Custom Ant Design styles
```

## Wallet Connection Options

### Option 1: RainbowKit (Currently Active)
The app currently uses RainbowKit for wallet connections. This is already configured and working.

### Option 2: Privy SDK (Available)
To switch to Privy for enhanced wallet features:
1. Get your Privy App ID from [Privy Dashboard](https://dashboard.privy.io)
2. Add to `.env`: `VITE_PRIVY_APP_ID=your_app_id`
3. Uncomment the Privy provider section in `src/App.tsx`
4. Comment out the RainbowKit provider section

## Building for Production
```bash
# Build the application
npm run build

# Preview production build locally
npm run preview
```

## Key Features Implemented

### 1. Navigation
- Fixed header with smooth navigation
- Mobile responsive menu
- Active route highlighting
- Wallet connection button

### 2. Landing Page
- Animated tech grid background (pure CSS)
- Feature cards with hover effects
- Live statistics display
- Technology stack showcase

### 3. How It Works
- 5-step process flow visualization
- Three-layer architecture diagram
- FHE technology explanation cards

### 4. Documentation
- Sidebar navigation
- Smart contract API reference
- Code examples with syntax highlighting
- Getting started guide
- Deployment instructions

### 5. DApp Interface
- Multi-tab interface for different operations
- Form modals for data submission
- Real-time statistics dashboard
- Encrypted data handling
- Mock data for demonstration

### 6. Roadmap
- Interactive timeline
- Phase progress tracking
- Upcoming features section
- Target milestones display

## Deployment

### Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Deploy to Netlify
```bash
# Build first
npm run build

# Drag and drop the 'dist' folder to Netlify
```

## Testing the DApp
1. Connect MetaMask wallet
2. Switch to Sepolia testnet
3. Get test ETH from [Sepolia Faucet](https://sepoliafaucet.com)
4. Navigate to DApp page
5. Test shipment submission and other features

## Browser Compatibility
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Optimizations
- Code splitting with lazy loading
- Optimized bundle size
- Efficient re-renders with React.memo
- Virtual scrolling for large lists
- Minified production build

## Notes
- All colors follow the blockchain tech style (dark backgrounds, blue accents)
- No purple/magenta colors are used anywhere
- Animations are smooth and subtle
- Mobile responsive design throughout
- FHE encryption is simulated in the frontend for demonstration