# CipheredSupply Deployment Guide

Complete guide for deploying the CipheredSupply Ledger smart contracts and frontend to production.

## 📋 Prerequisites

### Required Tools
- Node.js >= 18.0.0
- npm >= 9.0.0
- Git
- Ethereum wallet with Sepolia ETH (≥ 0.1 ETH recommended)

### Required Accounts
- **Infura** or **Alchemy** account (for Sepolia RPC)
- **Etherscan** account (for contract verification)
- **WalletConnect Cloud** project (for wallet integration)

---

## 🚀 Step 1: Environment Setup

### 1.1 Clone Repository

```bash
cd /Users/songsu/Desktop/zama/CipheredSupply-Ledger
```

### 1.2 Install Dependencies

```bash
# Install root dependencies (for contract deployment)
npm install

# Install webapp dependencies
cd webapp
npm install
cd ..
```

### 1.3 Configure Root `.env`

Create `.env` file in project root:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Your wallet private key (WITHOUT 0x prefix)
PRIVATE_KEY=abc123def456...

# Sepolia RPC URL (choose one)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
# OR
# SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=YOUR_ETHERSCAN_API_KEY

# Optional: Gas settings
GAS_PRICE_GWEI=50
GAS_LIMIT=8000000
```

⚠️ **IMPORTANT**: Never commit `.env` to git! It's already in `.gitignore`.

### 1.4 Configure Webapp `.env`

```bash
cd webapp
cp .env.example .env
```

Edit `webapp/.env`:

```env
# WalletConnect project ID (get from https://cloud.walletconnect.com)
VITE_WALLETCONNECT_ID=your_walletconnect_project_id

# Leave empty for now - will be filled after deployment
VITE_SUPPLY_LEDGER_ADDRESS=
```

---

## 📦 Step 2: Compile Contracts

### 2.1 Clean Previous Build

```bash
npm run clean
```

### 2.2 Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 6 Solidity files successfully
```

### 2.3 Verify Compilation

Check that artifacts were generated:

```bash
ls -la artifacts/contracts/
```

You should see:
- `CipheredSupplyLedger.sol/`
- `SupplyChainCore.sol/`
- `SupplyChainCustoms.sol/`
- `SupplyChainRoles.sol/`
- `SupplyChainStorage.sol/`
- `SupplyChainTypes.sol/`

---

## 🌐 Step 3: Deploy to Sepolia

### 3.1 Check Wallet Balance

Make sure your deployer wallet has enough Sepolia ETH:

```bash
# Check balance (replace with your address)
npx hardhat console --network sepolia

# In console:
const balance = await ethers.provider.getBalance("YOUR_ADDRESS")
console.log(ethers.formatEther(balance), "ETH")
```

You need at least **0.1 ETH** for safe deployment.

### 3.2 Deploy Contract

```bash
npm run deploy
```

Expected output:
```
🚀 Starting CipheredSupplyLedger deployment to Sepolia...

📍 Deploying contracts with account: 0xYourAddress
💰 Account balance: 0.5 ETH

📦 Deploying CipheredSupplyLedger contract...
✅ CipheredSupplyLedger deployed to: 0xContractAddress
🔗 View on Etherscan: https://sepolia.etherscan.io/address/0xContractAddress

⏳ Waiting for 5 block confirmations...
✅ Deployment confirmed!

📋 Contract Deployment Summary:
================================
Contract Address: 0xContractAddress
Deployer: 0xYourAddress
Network: Sepolia (Chain ID: 11155111)
Transaction Hash: 0xTxHash
================================

💾 Deployment info saved to deployments/sepolia-latest.json

🎯 Next Steps:
1. Update webapp/.env with:
   VITE_SUPPLY_LEDGER_ADDRESS=0xContractAddress

2. Verify contract on Etherscan:
   npx hardhat verify --network sepolia 0xContractAddress

3. Grant roles (if needed):
   - Customs Officer: contract.grantCustomsOfficer(address)
   - Quality Inspector: contract.grantQualityInspector(address)
   - Logistics Manager: contract.grantLogisticsManager(address)

✨ Deployment completed successfully!
```

### 3.3 Save Contract Address

Copy the contract address and update `webapp/.env`:

```env
VITE_SUPPLY_LEDGER_ADDRESS=0xYourDeployedContractAddress
```

### 3.4 Verify Contract on Etherscan

```bash
npx hardhat verify --network sepolia 0xYourDeployedContractAddress
```

Expected output:
```
Successfully verified contract CipheredSupplyLedger on Etherscan.
https://sepolia.etherscan.io/address/0xYourContractAddress#code
```

---

## 👥 Step 4: Grant Roles (Optional)

If you need to grant roles to other addresses:

### 4.1 Using Hardhat Console

```bash
npx hardhat console --network sepolia
```

```javascript
const contract = await ethers.getContractAt(
  "CipheredSupplyLedger",
  "0xYourContractAddress"
);

// Grant customs officer role
await contract.grantCustomsOfficer("0xOfficerAddress");

// Grant quality inspector role
await contract.grantQualityInspector("0xInspectorAddress");

// Grant logistics manager role
await contract.grantLogisticsManager("0xManagerAddress");
```

### 4.2 Verify Roles

```javascript
// Check if address has role
const isOfficer = await contract.customsOfficers("0xOfficerAddress");
console.log("Is customs officer:", isOfficer); // true

const isInspector = await contract.qualityInspectors("0xInspectorAddress");
console.log("Is quality inspector:", isInspector); // true

const isManager = await contract.logisticsManagers("0xManagerAddress");
console.log("Is logistics manager:", isManager); // true
```

---

## 🎨 Step 5: Deploy Frontend

### 5.1 Test Locally

```bash
cd webapp
npm run dev
```

Visit http://localhost:8080 and test:
1. Connect wallet (should show RainbowKit modal)
2. Verify network is Sepolia
3. Check contract address is displayed in header
4. Try submitting a test shipment

### 5.2 Build for Production

```bash
npm run build
```

Expected output:
```
vite v5.4.19 building for production...
✓ 1234 modules transformed.
dist/index.html                   1.23 kB
dist/assets/index-abc123.css     45.67 kB
dist/assets/index-xyz789.js      890.12 kB

✓ built in 12.34s
```

### 5.3 Test Production Build

```bash
npm run preview
```

Visit http://localhost:4173 and verify functionality.

### 5.4 Deploy to Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd webapp
vercel

# Follow prompts:
# - Project name: ciphered-supply-ledger
# - Framework: Vite
# - Build command: npm run build
# - Output directory: dist
```

Or use GitHub integration:
1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables in Vercel settings:
   - `VITE_WALLETCONNECT_ID`
   - `VITE_SUPPLY_LEDGER_ADDRESS`
4. Deploy

---

## ✅ Step 6: Post-Deployment Verification

### 6.1 Contract Health Check

Visit Etherscan and verify:
- ✅ Contract is verified
- ✅ Constructor arguments match
- ✅ Owner is set correctly
- ✅ Initial stats are 0

### 6.2 Frontend Health Check

Visit deployed URL and verify:
- ✅ Page loads without errors
- ✅ RainbowKit wallet modal opens
- ✅ Contract address displayed in header
- ✅ Stats section loads (shows 0s)
- ✅ All forms are functional

### 6.3 End-to-End Test

1. **Connect Wallet**: Click "Connect Wallet" → Select wallet → Approve
2. **Submit Shipment**: Fill form → Click "Submit Shipment" → Confirm transaction
3. **Verify Transaction**: Check Etherscan for transaction
4. **Query Shipment**: Enter shipment ID → Click "Search" → Verify data displayed

---

## 🔧 Troubleshooting

### Issue: Deployment Fails with "Insufficient Funds"

**Solution**: Add more Sepolia ETH to deployer wallet. Get free testnet ETH from:
- https://sepoliafaucet.com/
- https://www.alchemy.com/faucets/ethereum-sepolia

### Issue: Contract Verification Fails

**Solution**:
```bash
# Retry with explicit compiler version
npx hardhat verify --network sepolia \
  --contract contracts/CipheredSupplyLedger.sol:CipheredSupplyLedger \
  0xYourContractAddress
```

### Issue: Frontend Shows "Contract Address Not Configured"

**Solution**:
1. Check `webapp/.env` has `VITE_SUPPLY_LEDGER_ADDRESS` set
2. Restart dev server: `npm run dev`
3. Clear browser cache and reload

### Issue: Wallet Connection Fails

**Solution**:
1. Verify `VITE_WALLETCONNECT_ID` is set in `webapp/.env`
2. Check wallet is on Sepolia network
3. Try different wallet (MetaMask, Rainbow, etc.)

### Issue: Gateway Callback Not Working

**Solution**:
- Wait 5-10 minutes for Zama Gateway relayer
- Verify contract has sufficient test ETH for callback gas
- Check Sepolia network is not congested

---

## 📊 Monitoring

### Contract Events

Monitor contract events on Etherscan:
- `ShipmentSubmitted`
- `QualityInspectionCompleted`
- `CustomsClearanceRequested`
- `CustomsClearanceCompleted`
- `CheckpointRecorded`
- `ShipmentDelivered`
- `InsuranceClaimFiled`

### Frontend Analytics

Add analytics to track:
- Wallet connections
- Shipment submissions
- Transaction success/failure rates
- Average confirmation times

---

## 🔒 Security Checklist

- [ ] `.env` files are in `.gitignore`
- [ ] Private keys never committed to git
- [ ] Contract verified on Etherscan
- [ ] Owner address is secure hardware wallet
- [ ] Role addresses are trusted parties
- [ ] Frontend deployed with HTTPS
- [ ] Environment variables set in hosting platform
- [ ] WalletConnect project ID is production-ready

---

## 📚 Additional Resources

- **Zama FHE Docs**: https://docs.zama.ai/fhevm
- **Hardhat Docs**: https://hardhat.org/docs
- **RainbowKit Docs**: https://www.rainbowkit.com/docs
- **Vite Deployment**: https://vitejs.dev/guide/static-deploy.html
- **Vercel Deployment**: https://vercel.com/docs

---

## 🆘 Support

If you encounter issues:
1. Check this deployment guide
2. Review contract code and comments
3. Check Zama Discord for FHE-specific questions
4. Open GitHub issue for project-specific bugs

---

**✨ Congratulations! Your CipheredSupply Ledger is now live on Sepolia! ✨**
