# CipherSupply

<div align="center">

![CipherSupply](https://img.shields.io/badge/CipherSupply-Privacy--First%20Supply%20Chain-blue?style=for-the-badge)

**Privacy-Preserving Supply Chain Management with Fully Homomorphic Encryption**

[![fhEVM](https://img.shields.io/badge/fhEVM-v0.9.1-green?style=flat-square)](https://docs.zama.ai/fhevm)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.28-363636?style=flat-square)](https://soliditylang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Sepolia](https://img.shields.io/badge/Network-Sepolia-purple?style=flat-square)](https://sepolia.etherscan.io/)

[Live Demo](https://fhe-supply-ledger.vercel.app) | [Smart Contract](https://sepolia.etherscan.io/address/0x178c4Eff624f621534D0940232476e6e6F02Cd89) | [Documentation](#smart-contract-architecture)

</div>

---

## Overview

CipherSupply is a decentralized supply chain management platform that leverages **Zama's Fully Homomorphic Encryption (FHE)** to enable privacy-preserving shipment tracking. The platform allows businesses to track shipments while keeping sensitive financial data (shipment values) encrypted on-chain, ensuring confidentiality without sacrificing transparency.

### The Problem

Traditional supply chain systems face a critical trade-off:
- **Public blockchains** offer transparency and immutability but expose sensitive business data
- **Private databases** protect data but lack trustless verification and auditability
- **Competitors, regulators, and malicious actors** can exploit exposed shipment values

### The Solution

CipherSupply uses **Fully Homomorphic Encryption (FHE)** to encrypt sensitive shipment values directly on Ethereum. The encrypted data remains confidential while still being verifiable and auditable on-chain.

```
┌─────────────────────────────────────────────────────────────────────┐
│                        CipherSupply Architecture                     │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐         │
│   │   Shipper    │    │   Carrier    │    │   Receiver   │         │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘         │
│          │                   │                   │                  │
│          ▼                   ▼                   ▼                  │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │                    React DApp (Vite + TypeScript)            │  │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │  │
│   │  │ Ant Design  │  │  RainbowKit │  │  Zama Relayer SDK   │  │  │
│   │  │     UI      │  │    Wallet   │  │   FHE Encryption    │  │  │
│   │  └─────────────┘  └─────────────┘  └─────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                │                                    │
│                                ▼                                    │
│   ┌─────────────────────────────────────────────────────────────┐  │
│   │              Ethereum Sepolia (EVM + FHE Coprocessor)        │  │
│   │  ┌─────────────────────────────────────────────────────┐    │  │
│   │  │           SimplifiedSupplyLedger.sol                 │    │  │
│   │  │  ┌─────────────┐  ┌──────────────────────────────┐  │    │  │
│   │  │  │  euint64    │  │  Shipment Management Logic   │  │    │  │
│   │  │  │ valueCipher │  │  (submit, transit, deliver)  │  │    │  │
│   │  │  └─────────────┘  └──────────────────────────────┘  │    │  │
│   │  └─────────────────────────────────────────────────────┘    │  │
│   │                              │                               │  │
│   │  ┌───────────────────────────┴───────────────────────────┐  │  │
│   │  │              Zama FHE Infrastructure                   │  │  │
│   │  │  ┌─────────┐  ┌──────────────┐  ┌───────────────┐     │  │  │
│   │  │  │   ACL   │  │ Coprocessor  │  │  KMSVerifier  │     │  │  │
│   │  │  └─────────┘  └──────────────┘  └───────────────┘     │  │  │
│   │  └───────────────────────────────────────────────────────┘  │  │
│   └─────────────────────────────────────────────────────────────┘  │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Key Features

| Feature | Description |
|---------|-------------|
| **FHE-Encrypted Values** | Shipment values are encrypted using `euint64` type, remaining confidential on-chain |
| **Access Control** | Fine-grained permissions via `FHE.allow()` for shipper, carrier, and receiver |
| **Shipment Lifecycle** | Complete tracking from Draft → Submitted → InTransit → Delivered/Lost |
| **Role-Based Authorization** | Owner, Carrier, and Receiver roles with specific permissions |
| **On-Chain Statistics** | Real-time tracking of total shipments, delivered count, and active shipments |

---

## Smart Contract Architecture

### Contract Details

| Property | Value |
|----------|-------|
| **Contract Name** | `SimplifiedSupplyLedger` |
| **Network** | Ethereum Sepolia Testnet |
| **Address** | [`0x178c4Eff624f621534D0940232476e6e6F02Cd89`](https://sepolia.etherscan.io/address/0x178c4Eff624f621534D0940232476e6e6F02Cd89) |
| **Solidity Version** | 0.8.28 |
| **fhEVM Version** | 0.9.1 |
| **License** | MIT |

### Zama FHE Coprocessor Configuration (Sepolia)

```solidity
CoprocessorConfig({
    ACLAddress: 0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D,
    CoprocessorAddress: 0x92C920834Ec8941d2C77D188936E1f7A6f49c127,
    KMSVerifierAddress: 0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A
})
```

### Data Structures

#### Shipment Status Enum

```solidity
enum ShipmentStatus {
    Draft,      // 0: Initial state
    Submitted,  // 1: Shipment created and submitted
    InTransit,  // 2: Shipment picked up by carrier
    Delivered,  // 3: Successfully delivered to receiver
    Lost        // 4: Shipment marked as lost
}
```

#### Shipment Struct

```solidity
struct Shipment {
    bytes32 shipmentId;      // Unique identifier
    address shipper;         // Creator of the shipment
    address carrier;         // Transportation provider
    address receiver;        // Destination recipient

    // FHE-Encrypted field (confidential)
    euint64 valueCipher;     // Encrypted shipment value in USD

    // Plaintext fields (public)
    uint256 weightKg;        // Weight in kilograms
    uint256 quantity;        // Number of items
    uint256 riskCode;        // Risk assessment (0-9)
    uint256 temperature;     // Required temperature
    uint256 humidity;        // Required humidity level
    uint256 priority;        // Shipping priority (1-5)
    string category;         // Product category

    // Status tracking
    ShipmentStatus status;
    uint256 submittedAt;     // Submission timestamp
    uint256 deliveredAt;     // Delivery timestamp
    bool isActive;           // Active status flag
}
```

### Core Functions

#### `submitShipment`

Creates a new shipment with encrypted value.

```solidity
function submitShipment(
    bytes32 shipmentId,
    address carrier,
    address receiver,
    externalEuint64 encryptedValue,  // FHE-encrypted value
    bytes calldata valueProof,        // ZK proof for encryption
    uint256 weightKg,
    uint256 quantity,
    uint256 riskCode,
    uint256 temperature,
    uint256 humidity,
    uint256 priority,
    string calldata category
) external returns (bytes32)
```

**FHE Operations:**
```solidity
// Convert external encrypted input to internal euint64
euint64 value = FHE.fromExternal(encryptedValue, valueProof);

// Grant access to contract and shipper
FHE.allow(value, address(this));
FHE.allow(value, msg.sender);
```

#### `startTransit`

Marks shipment as in transit. Only callable by carrier or shipper.

```solidity
function startTransit(bytes32 shipmentId) external
```

#### `markDelivered`

Marks shipment as delivered. Only callable by receiver or carrier.

```solidity
function markDelivered(bytes32 shipmentId) external
```

#### `markLost`

Marks shipment as lost. Only callable by shipper or carrier.

```solidity
function markLost(bytes32 shipmentId) external
```

#### `getShipmentInfo`

Returns all public shipment information (encrypted value not included).

```solidity
function getShipmentInfo(bytes32 shipmentId) external view returns (
    address shipper,
    address carrier,
    address receiver,
    string memory category,
    ShipmentStatus status,
    uint256 submittedAt,
    uint256 deliveredAt,
    bool isActive,
    uint256 weightKg,
    uint256 quantity,
    uint256 riskCode,
    uint256 temperature,
    uint256 humidity,
    uint256 priority
)
```

#### `getSupplyStats`

Returns aggregate statistics.

```solidity
function getSupplyStats() external view returns (
    uint256 totalShipments,
    uint256 delivered,
    uint256 active
)
```

### Events

```solidity
event ShipmentSubmitted(
    bytes32 indexed shipmentId,
    address indexed shipper,
    address indexed carrier,
    string category,
    uint256 timestamp
);

event ShipmentStatusChanged(
    bytes32 indexed shipmentId,
    ShipmentStatus oldStatus,
    ShipmentStatus newStatus,
    uint256 timestamp
);
```

---

## FHE Integration Deep Dive

### How FHE Works in CipherSupply

1. **Client-Side Encryption**: The frontend uses Zama's `relayer-sdk` to encrypt the shipment value before sending it to the blockchain.

2. **Proof Generation**: Along with the ciphertext, a zero-knowledge proof is generated to verify the encryption was performed correctly.

3. **On-Chain Verification**: The smart contract uses `FHE.fromExternal()` to verify the proof and convert the external ciphertext to an internal `euint64`.

4. **Access Control**: `FHE.allow()` grants specific addresses the ability to decrypt or compute on the encrypted value.

```typescript
// Frontend encryption flow
const fheClient = await getFheClient();
const { handles, inputProof } = await fheClient.encrypt64(shipmentValue);

// Contract call with encrypted data
await contract.submitShipment(
    shipmentId,
    carrier,
    receiver,
    handles[0],      // externalEuint64
    inputProof,      // ZK proof
    // ... other params
);
```

### Security Properties

| Property | Guarantee |
|----------|-----------|
| **Confidentiality** | Shipment values are never revealed on-chain |
| **Integrity** | ZK proofs ensure ciphertexts are valid encryptions |
| **Access Control** | Only authorized parties can decrypt values |
| **Auditability** | All transactions are recorded on Ethereum |

---

## Technology Stack

### Smart Contracts

| Component | Technology |
|-----------|------------|
| Language | Solidity 0.8.28 |
| Framework | Hardhat |
| FHE Library | @fhevm/solidity 0.9.1 |
| Plugin | @fhevm/hardhat-plugin 0.3.0-1 |
| Network | Ethereum Sepolia |

### Frontend

| Component | Technology |
|-----------|------------|
| Framework | React 18 + TypeScript |
| Build Tool | Vite 5.4 |
| UI Library | Ant Design 5.27 |
| Styling | Tailwind CSS 3.4 |
| Web3 | Wagmi 2.18 + Viem 2.38 |
| Wallet | RainbowKit 2.2 |
| FHE SDK | fhevmjs 0.6.2 (CDN) |
| Animations | Framer Motion |

### Infrastructure

| Component | Provider |
|-----------|----------|
| Frontend Hosting | Vercel |
| Blockchain | Ethereum Sepolia |
| FHE Network | Zama Coprocessor |

---

## Project Structure

```
CipherIdentity-Ledger/
├── contracts/
│   └── SimplifiedSupplyLedger.sol    # Main FHE-enabled contract
├── scripts/
│   └── deploy-simplified.js          # Deployment script
├── webapp/
│   ├── src/
│   │   ├── components/               # React UI components
│   │   ├── hooks/                    # Custom React hooks
│   │   │   └── useSimplifiedSupplyLedger.ts
│   │   ├── contracts/                # ABI and contract configs
│   │   ├── pages/                    # Application pages
│   │   └── config/                   # Wagmi and app config
│   ├── public/                       # Static assets
│   └── package.json
├── hardhat.config.js                 # Hardhat configuration
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- MetaMask or compatible Web3 wallet
- Sepolia ETH ([Faucet](https://sepoliafaucet.com/))

### Installation

```bash
# Clone the repository
git clone https://github.com/your-repo/CipherIdentity-Ledger.git
cd CipherIdentity-Ledger

# Install contract dependencies
npm install

# Install frontend dependencies
cd webapp
npm install
```

### Environment Configuration

**Root `.env`:**
```env
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=your_etherscan_api_key
```

**`webapp/.env`:**
```env
VITE_SIMPLIFIED_SUPPLY_LEDGER_ADDRESS=0x178c4Eff624f621534D0940232476e6e6F02Cd89
```

### Development

```bash
# Start frontend dev server
cd webapp
npm run dev

# Compile contracts
npx hardhat compile

# Deploy to Sepolia
SEPOLIA_RPC_URL="https://ethereum-sepolia-rpc.publicnode.com" \
npx hardhat run scripts/deploy-simplified.js --network sepolia
```

### Production Build

```bash
cd webapp
npm run build
```

---

## Deployment History

| Version | Date | Contract Address | Notes |
|---------|------|------------------|-------|
| v1.0.0 | 2024-12-04 | `0x178c4Eff624f621534D0940232476e6e6F02Cd89` | fhEVM 0.9.1, ZamaEthereumConfig |

---

## Security Considerations

### Encryption Guarantees

- **FHE Security**: Based on Ring-LWE problem, considered post-quantum secure
- **Proof Verification**: All encrypted inputs are verified on-chain
- **Access Control**: Fine-grained permissions via ACL contract

### Smart Contract Security

- **Access Modifiers**: `onlyOwner` for administrative functions
- **Input Validation**: All inputs are validated before processing
- **Status Checks**: State machine ensures valid transitions

### Recommendations

1. Never share private keys
2. Verify contract addresses before transactions
3. Use hardware wallets for production deployments
4. Audit contracts before mainnet deployment

---

## Performance Metrics

| Metric | Value |
|--------|-------|
| Encryption Time | ~5-10 seconds |
| Gas (submitShipment) | ~300,000-500,000 |
| Gas (statusChange) | ~50,000-100,000 |
| Block Confirmations | 5 (recommended) |

---

## Links

- **Live Demo**: https://fhe-supply-ledger.vercel.app
- **Contract (Sepolia)**: https://sepolia.etherscan.io/address/0x178c4Eff624f621534D0940232476e6e6F02Cd89
- **Zama FHE Docs**: https://docs.zama.ai/fhevm
- **Zama Website**: https://www.zama.ai/

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Acknowledgments

- [Zama](https://www.zama.ai/) - Fully Homomorphic Encryption technology
- [Hardhat](https://hardhat.org/) - Ethereum development environment
- [Ant Design](https://ant.design/) - UI component library
- [RainbowKit](https://www.rainbowkit.com/) - Web3 wallet connection

---

<div align="center">

**Built with Zama's Fully Homomorphic Encryption**

*Enabling privacy-preserving supply chain management on Ethereum*

</div>
