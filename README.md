# CipherSupply - Privacy-Preserving Supply Chain Management

<div align="center">

![CipherSupply Logo](./webapp/public/logo.svg)

**Privacy-First Supply Chain Tracking Powered by Zama's Fully Homomorphic Encryption**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-black)](https://ciphersupply.vercel.app)
[![Sepolia Testnet](https://img.shields.io/badge/Network-Sepolia-purple)](https://sepolia.etherscan.io/)

[Live Demo](https://ciphersupply.vercel.app) • [Documentation](#documentation) • [Architecture](#architecture)

</div>

## 🌟 Overview

CipherSupply is a decentralized supply chain management platform that leverages **Zama's Fully Homomorphic Encryption (FHE)** technology to enable privacy-preserving shipment tracking. Sensitive data such as shipment value, weight, quantity, and risk assessments remain encrypted on-chain while still enabling verification and computation.

### Key Features

- 🔐 **Fully Homomorphic Encryption**: Sensitive shipment data encrypted using Zama's FHE technology
- ⚡ **Fast Encryption**: ~15 second encryption time for critical parameters
- 🌐 **Decentralized**: Ethereum Sepolia testnet deployment
- 🎨 **Modern UI**: Clean, responsive interface built with React and Ant Design
- 📊 **Real-time Tracking**: Monitor shipment status with encrypted data
- 🔗 **Web3 Integration**: Seamless wallet connection via RainbowKit

## 🏗️ Architecture

### Smart Contracts

- **SimplifiedSupplyLedger.sol**: Main contract implementing FHE-encrypted shipment management
  - Deployed on Sepolia: `0xfe340cc4393657c378DF79245d3BB5f167d469a0`
  - Built with fhevm 0.6.2 (TFHE library)
  - Optimized for gas efficiency with 4 encrypted parameters

### Frontend Stack

- **Framework**: React 18 with TypeScript
- **Styling**: Ant Design 5.0 + Tailwind CSS
- **Web3**: Wagmi + Viem + RainbowKit
- **Encryption**: Zama relayer-sdk-js 0.2.0 (CDN)
- **Build**: Vite
- **Deployment**: Vercel

### Encrypted Parameters

1. **Weight** (kg) - euint64
2. **Declared Value** ($) - euint64  
3. **Quantity** (units) - euint32
4. **Risk Code** (0-5) - euint8

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Sepolia ETH for testing

### Installation

```bash
# Clone the repository
git clone https://github.com/xjensen-johnb/CipheredSupply-Ledger.git
cd CipheredSupply-Ledger

# Install contract dependencies
npm install

# Install frontend dependencies
cd webapp
npm install
```

### Environment Setup

Create `.env` file in project root:

```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=your_etherscan_api_key
```

Create `webapp/.env`:

```env
VITE_SUPPLY_LEDGER_ADDRESS=0xfe340cc4393657c378DF79245d3BB5f167d469a0
```

### Development

```bash
# Start frontend dev server
cd webapp
npm run dev

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
npx hardhat run scripts/deploy-simplified.js --network sepolia
```

### Production Build

```bash
cd webapp
npm run build
```

## 📖 Documentation

### Smart Contract Functions

#### Submit Shipment
```solidity
function submitShipment(
    bytes32 shipmentId,
    address carrier,
    address receiver,
    bytes calldata encryptedWeight,
    bytes calldata weightProof,
    bytes calldata encryptedValue,
    bytes calldata valueProof,
    bytes calldata encryptedQuantity,
    bytes calldata quantityProof,
    bytes calldata encryptedRisk,
    bytes calldata riskProof,
    uint256 temperature,
    uint256 humidity,
    uint256 priority,
    uint8 category
) external returns (bytes32)
```

#### Mark Delivered
```solidity
function markDelivered(bytes32 shipmentId) external
```

#### View Shipment Info
```solidity
function getShipmentInfo(bytes32 shipmentId) external view returns (...)
```

### Frontend Integration

```typescript
import { useSimplifiedSupplyLedger } from '@/hooks/useSimplifiedSupplyLedger';

const { submitShipment, isReady } = useSimplifiedSupplyLedger();

// Submit encrypted shipment
await submitShipment({
  shipmentId: uniqueId,
  carrier: carrierAddress,
  receiver: receiverAddress,
  weightKg: 1000,
  declaredValue: 50000,
  quantity: 100,
  riskCode: 1,
  // ... other params
});
```

## 🗺️ Roadmap

### Phase 1: Foundation & Development (Oct-Nov 2025) - 75% Complete
- ✅ Smart contract architecture with FHE
- ✅ Sepolia testnet deployment
- ✅ Frontend DApp development
- ✅ Performance optimization (15s encryption)

### Phase 2: Security & Testing (Dec 2025)
- 🔄 Comprehensive security audit
- 🔄 Smart contract optimization
- 🔄 Community testing program
- 🔄 Bug fixes and improvements

### Phase 3: Mainnet Preparation (Jan 2026)
- 📋 Final audit completion
- 📋 Mainnet deployment preparation
- 📋 Partner onboarding program
- 📋 Marketing campaign launch

### Phase 4: Mainnet Launch (Feb-Mar 2026)
- 📋 Ethereum mainnet deployment
- 📋 Production DApp launch
- 📋 Enterprise partnerships activation
- 📋 Community growth initiatives

### Phase 5: Multi-chain Expansion (Q2 2026)
- 📋 Polygon and Arbitrum integration
- 📋 Cross-chain bridge development
- 📋 Enhanced scalability features
- 📋 Global supply chain partnerships

## 🔧 Technology Stack

### Smart Contracts
- Solidity 0.8.24
- Hardhat
- fhevm 0.6.2 (Zama TFHE library)
- OpenZeppelin Contracts

### Frontend
- React 18
- TypeScript
- Ant Design 5.0
- Tailwind CSS
- Wagmi + Viem
- RainbowKit
- Framer Motion

### Infrastructure
- Vercel (Frontend)
- Ethereum Sepolia (Testnet)
- Zama FHE Network
- IPFS (Future)

## 📊 Performance Metrics

- **Encryption Time**: ~15 seconds for 4 parameters
- **Gas Optimization**: 70% reduction vs. unoptimized version
- **Network**: Sepolia Testnet
- **Uptime Target**: 99.9%

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests to our repository.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- **Live Demo**: https://ciphersupply.vercel.app
- **Contract**: [0xfe340...469a0](https://sepolia.etherscan.io/address/0xfe340cc4393657c378DF79245d3BB5f167d469a0)
- **Documentation**: [View Docs](https://ciphersupply.vercel.app/docs)
- **Zama FHE**: https://www.zama.ai/

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHE technology
- [Hardhat](https://hardhat.org/) for development environment
- [Ant Design](https://ant.design/) for UI components
- [RainbowKit](https://www.rainbowkit.com/) for Web3 connectivity

---

<div align="center">
Built with ❤️ using Zama's Fully Homomorphic Encryption
</div>
