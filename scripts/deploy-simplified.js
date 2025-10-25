const hre = require("hardhat");

async function main() {
  console.log("🚀 Starting SimplifiedSupplyLedger deployment to Sepolia...\n");
  console.log("⚡ Using @fhevm/solidity 0.8.0 with FHE library - compatible with relayer-sdk 0.2.0!\n");

  const [deployer] = await hre.ethers.getSigners();

  console.log("📍 Deploying contracts with account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH");

  // Check if balance is sufficient
  const minBalance = hre.ethers.parseEther("0.01");
  if (balance < minBalance) {
    console.log("⚠️  WARNING: Low balance! Make sure you have enough ETH for deployment");
  }

  // Deploy the simplified contract
  console.log("\n📦 Deploying SimplifiedSupplyLedger contract...");
  const SimplifiedSupplyLedger = await hre.ethers.getContractFactory("SimplifiedSupplyLedger");
  const contract = await SimplifiedSupplyLedger.deploy();

  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();
  console.log("✅ SimplifiedSupplyLedger deployed to:", contractAddress);
  console.log("🔗 View on Etherscan: https://sepolia.etherscan.io/address/" + contractAddress);

  // Wait for block confirmations
  console.log("\n⏳ Waiting for 5 block confirmations...");
  await contract.deploymentTransaction().wait(5);
  console.log("✅ Contract confirmed!");

  console.log("\n✨ Deployment Summary:");
  console.log("=====================================");
  console.log("Network: Sepolia");
  console.log("Contract: SimplifiedSupplyLedger");
  console.log("Address:", contractAddress);
  console.log("Deployer:", deployer.address);
  console.log("@fhevm/solidity version: 0.8.0 (FHE library)");
  console.log("=====================================");

  console.log("\n📝 Next Steps:");
  console.log("1. Update your webapp/.env file:");
  console.log(`   VITE_SIMPLIFIED_SUPPLY_LEDGER_ADDRESS=${contractAddress}`);
  console.log("2. Test the working FHE encryption with relayer-sdk 0.2.0 and fhevmjs 0.8.0!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });
